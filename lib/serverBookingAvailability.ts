import type { BookingStatus, Prisma, PrismaClient } from "@prisma/client";

const SLOT_INTERVAL_MINUTES = 30;
const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED"];
const PAYMENT_ATTEMPT_HOLD_MINUTES = 30;

type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type DbClient = PrismaClient | PrismaTransaction;

export type AvailableStaff = {
  id: string;
  name: string;
};

export type AvailabilitySlot = {
  time: string;
  availableStaff: AvailableStaff[];
  groups: AvailableStaff[][];
};

export type AvailabilityResult = {
  date: string;
  duration: number;
  people: number;
  staff: string | null;
  isClosed: boolean;
  closedReason: string | null;
  openTime: string | null;
  closeTime: string | null;
  slots: AvailabilitySlot[];
};

export type BookingAvailabilityCheck = {
  ok: boolean;
  reason?: string;
  staffNames: string[];
};

type BookingLike = {
  date: Date;
  duration: number;
  staff: string;
  stripePaymentIntentId?: string | null;
};

type StaffShift = {
  startTime: string;
  endTime: string;
  staff: {
    id: string;
    name: string;
  };
};

export function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  return hour * 60 + minute;
}

export function minutesToTime(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`;
}

export function dateToUtcDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function dateToUtcTimeValue(date: Date) {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes()
  ).padStart(2, "0")}`;
}

export function getUtcDayRange(dateValue: string) {
  const targetDate = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  const nextDate = new Date(targetDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  return {
    targetDate,
    nextDate,
  };
}

export function getMondayBasedDayOfWeek(date: Date) {
  const sundayBasedDay = date.getUTCDay();

  return (sundayBasedDay + 6) % 7;
}

export function bookingStaffNames(value: string) {
  return value
    .split("+")
    .map((name) => name.trim())
    .filter(Boolean);
}

export function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) {
    return [[]];
  }

  if (items.length < size) {
    return [];
  }

  const result: T[][] = [];

  for (let index = 0; index <= items.length - size; index += 1) {
    const current = items[index];
    const remaining = items.slice(index + 1);

    for (const combination of combinations(remaining, size - 1)) {
      result.push([current, ...combination]);
    }
  }

  return result;
}

export function bookingOverlaps(
  booking: BookingLike,
  startMinutes: number,
  endMinutes: number,
  staffName: string
) {
  const bookedStaff = bookingStaffNames(booking.staff);

  if (!bookedStaff.includes(staffName)) {
    return false;
  }

  const bookingStart =
    booking.date.getUTCHours() * 60 + booking.date.getUTCMinutes();
  const bookingEnd = bookingStart + booking.duration;

  return startMinutes < bookingEnd && endMinutes > bookingStart;
}

function staffCanTakeBooking(
  shift: StaffShift,
  bookings: BookingLike[],
  startMinutes: number,
  endMinutes: number
) {
  const shiftStart = timeToMinutes(shift.startTime);
  const shiftEnd = timeToMinutes(shift.endTime);

  if (shiftStart > startMinutes || shiftEnd < endMinutes) {
    return false;
  }

  return !bookings.some((booking) =>
    bookingOverlaps(booking, startMinutes, endMinutes, shift.staff.name)
  );
}

export async function getAvailabilityForDate(
  db: DbClient,
  input: {
    storeId: string;
    dateValue: string;
    duration: number;
    people: number;
    requestedStaff?: string | null;
    ignorePaymentIntentId?: string | null;
  }
): Promise<AvailabilityResult> {
  const dayRange = getUtcDayRange(input.dateValue);

  if (!dayRange) {
    throw new Error("Invalid date");
  }

  const { targetDate, nextDate } = dayRange;

  const holiday = await db.holiday.findUnique({
    where: {
      storeId_date: {
        storeId: input.storeId,
        date: targetDate,
      },
    },
  });

  if (holiday) {
    return {
      date: input.dateValue,
      duration: input.duration,
      people: input.people,
      staff: input.requestedStaff ?? null,
      isClosed: true,
      closedReason: holiday.reason,
      openTime: null,
      closeTime: null,
      slots: [],
    };
  }

  const businessHour = await db.businessHour.findUnique({
    where: {
      storeId_dayOfWeek: {
        storeId: input.storeId,
        dayOfWeek: getMondayBasedDayOfWeek(targetDate),
      },
    },
  });

  if (!businessHour || businessHour.isClosed) {
    return {
      date: input.dateValue,
      duration: input.duration,
      people: input.people,
      staff: input.requestedStaff ?? null,
      isClosed: true,
      closedReason: "定休日",
      openTime: businessHour?.openTime ?? null,
      closeTime: businessHour?.closeTime ?? null,
      slots: [],
    };
  }

  const openMinutes = timeToMinutes(businessHour.openTime);
  const closeMinutes = timeToMinutes(businessHour.closeTime);

  if (openMinutes >= closeMinutes) {
    throw new Error("Invalid business hours");
  }

  const holdStartedAt = new Date(
    Date.now() - PAYMENT_ATTEMPT_HOLD_MINUTES * 60 * 1000
  );

  const [shifts, bookings, paymentAttempts] = await Promise.all([
    db.shift.findMany({
      where: {
        date: targetDate,
        isWorking: true,
        staff: {
          storeId: input.storeId,
          active: true,
          ...(input.requestedStaff
            ? {
                name: input.requestedStaff,
              }
            : {}),
        },
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        staff: {
          createdAt: "asc",
        },
      },
    }),
    db.booking.findMany({
      where: {
        storeId: input.storeId,
        date: {
          gte: targetDate,
          lt: nextDate,
        },
        status: {
          in: ACTIVE_BOOKING_STATUSES,
        },
      },
      select: {
        date: true,
        duration: true,
        staff: true,
      },
    }),
    db.bookingPaymentAttempt.findMany({
      where: {
        storeId: input.storeId,
        date: {
          gte: targetDate,
          lt: nextDate,
        },
        status: "CREATED",
        createdAt: {
          gte: holdStartedAt,
        },
        ...(input.ignorePaymentIntentId
          ? {
              stripePaymentIntentId: {
                not: input.ignorePaymentIntentId,
              },
            }
          : {}),
      },
      select: {
        date: true,
        duration: true,
        staff: true,
        stripePaymentIntentId: true,
      },
    }),
  ]);

  const unavailableBookings: BookingLike[] = [
    ...bookings,
    ...paymentAttempts,
  ];

  const slots: AvailabilitySlot[] = [];

  for (
    let startMinutes = openMinutes;
    startMinutes + input.duration <= closeMinutes;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const endMinutes = startMinutes + input.duration;

    const availableStaff = shifts
      .filter((shift) =>
        staffCanTakeBooking(shift, unavailableBookings, startMinutes, endMinutes)
      )
      .map((shift) => ({
        id: shift.staff.id,
        name: shift.staff.name,
      }));

    const groups = combinations(availableStaff, input.people);

    if (groups.length > 0) {
      slots.push({
        time: minutesToTime(startMinutes),
        availableStaff,
        groups,
      });
    }
  }

  return {
    date: input.dateValue,
    duration: input.duration,
    people: input.people,
    staff: input.requestedStaff ?? null,
    isClosed: false,
    closedReason: null,
    openTime: businessHour.openTime,
    closeTime: businessHour.closeTime,
    slots,
  };
}

export async function checkRequestedBookingAvailability(
  db: DbClient,
  input: {
    storeId: string;
    dateValue: string;
    startTime: string;
    duration: number;
    people: number;
    staffNames: string[];
    ignorePaymentIntentId?: string | null;
  }
): Promise<BookingAvailabilityCheck> {
  if (input.staffNames.length !== input.people) {
    return {
      ok: false,
      reason: "予約人数分の担当者を選択してください。",
      staffNames: input.staffNames,
    };
  }

  const availability = await getAvailabilityForDate(db, {
    storeId: input.storeId,
    dateValue: input.dateValue,
    duration: input.duration,
    people: input.people,
    ignorePaymentIntentId: input.ignorePaymentIntentId,
  });

  if (availability.isClosed) {
    return {
      ok: false,
      reason: availability.closedReason || "この日は予約できません。",
      staffNames: input.staffNames,
    };
  }

  const slot = availability.slots.find((item) => item.time === input.startTime);

  if (!slot) {
    return {
      ok: false,
      reason: "指定された時間は予約できません。",
      staffNames: input.staffNames,
    };
  }

  const requestedKey = normalizeStaffGroup(input.staffNames);
  const hasMatchingGroup = slot.groups.some(
    (group) => normalizeStaffGroup(group.map((staff) => staff.name)) === requestedKey
  );

  return {
    ok: hasMatchingGroup,
    reason: hasMatchingGroup
      ? undefined
      : "指定された担当者では予約できません。",
    staffNames: input.staffNames,
  };
}

export function normalizeStaffGroup(staffNames: string[]) {
  return [...staffNames].sort((a, b) => a.localeCompare(b, "ja")).join("+");
}

export function buildBookingNo() {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

  return `YOYAKU-${timestamp}-${random}`;
}

export function calculateBookingPrice(duration: number, people: number) {
  const totalPrice = duration * 150 * people;

  return {
    totalPrice,
    deposit: Math.round(totalPrice * 0.15),
  };
}

export function bookingAdvisoryLockKeys(
  storeId: string,
  dateValue: string,
  staffNames: string[]
) {
  return [...staffNames]
    .sort((a, b) => a.localeCompare(b, "ja"))
    .map((staffName) => `booking:${storeId}:${dateValue}:${staffName}`);
}

export async function acquireBookingLocks(
  tx: Prisma.TransactionClient,
  storeId: string,
  dateValue: string,
  staffNames: string[]
) {
  for (const lockKey of bookingAdvisoryLockKeys(storeId, dateValue, staffNames)) {
    await tx.$queryRaw`
      SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
    `;
  }
}

export function isTransactionConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2034"
  );
}

export type TxOptions = {
  isolationLevel: Prisma.TransactionIsolationLevel;
  maxWait: number;
  timeout: number;
};
