import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const SLOT_INTERVAL_MINUTES = 30;

type AvailableStaff = {
  id: string;
  name: string;
};

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  return hour * 60 + minute;
}

function minutesToTime(value: number) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`;
}

function getMondayBasedDayOfWeek(date: Date) {
  const sundayBasedDay = date.getUTCDay();

  return (sundayBasedDay + 6) % 7;
}

function combinations<T>(items: T[], size: number): T[][] {
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

function bookingStaffNames(value: string) {
  return value
    .split("+")
    .map((name) => name.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const dateValue = searchParams.get("date");
  const duration = Number(searchParams.get("duration") ?? 60);
  const people = Number(searchParams.get("people") ?? 1);
  const requestedStaff = searchParams.get("staff")?.trim() || null;

  if (!dateValue) {
    return NextResponse.json(
      {
        error: "日付を指定してください。",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ||
    !Number.isInteger(duration) ||
    duration <= 0 ||
    !Number.isInteger(people) ||
    people <= 0
  ) {
    return NextResponse.json(
      {
        error: "予約条件が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const targetDate = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(targetDate.getTime())) {
    return NextResponse.json(
      {
        error: "日付が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const nextDate = new Date(targetDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  const holiday = await prisma.holiday.findUnique({
    where: {
      date: targetDate,
    },
  });

  if (holiday) {
    return NextResponse.json({
      date: dateValue,
      duration,
      people,
      staff: requestedStaff,
      isClosed: true,
      closedReason: holiday.reason,
      openTime: null,
      closeTime: null,
      slots: [],
    });
  }

  const dayOfWeek = getMondayBasedDayOfWeek(targetDate);

  const businessHour = await prisma.businessHour.findUnique({
    where: {
      dayOfWeek,
    },
  });

  if (!businessHour || businessHour.isClosed) {
    return NextResponse.json({
      date: dateValue,
      duration,
      people,
      staff: requestedStaff,
      isClosed: true,
      closedReason: "定休日",
      openTime: businessHour?.openTime ?? null,
      closeTime: businessHour?.closeTime ?? null,
      slots: [],
    });
  }

  const openMinutes = timeToMinutes(businessHour.openTime);
  const closeMinutes = timeToMinutes(businessHour.closeTime);

  if (openMinutes >= closeMinutes) {
    return NextResponse.json(
      {
        error: "営業時間の設定が正しくありません。",
      },
      {
        status: 500,
      }
    );
  }

  const [shifts, bookings] = await Promise.all([
    prisma.shift.findMany({
      where: {
        date: targetDate,
        isWorking: true,
        staff: {
          active: true,
          ...(requestedStaff
            ? {
                name: requestedStaff,
              }
            : {}),
        },
      },
      include: {
        staff: true,
      },
      orderBy: {
        staff: {
          createdAt: "asc",
        },
      },
    }),

    prisma.booking.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: nextDate,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        date: true,
        duration: true,
        staff: true,
      },
    }),
  ]);

  const slots: Array<{
    time: string;
    availableStaff: AvailableStaff[];
    groups: AvailableStaff[][];
  }> = [];

  for (
    let startMinutes = openMinutes;
    startMinutes + duration <= closeMinutes;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const endMinutes = startMinutes + duration;

    const availableStaff = shifts
      .filter((shift) => {
        const shiftStart = timeToMinutes(shift.startTime);
        const shiftEnd = timeToMinutes(shift.endTime);

        if (shiftStart > startMinutes || shiftEnd < endMinutes) {
          return false;
        }

        const hasConflictingBooking = bookings.some((booking) => {
          const bookedStaff = bookingStaffNames(booking.staff);

          if (!bookedStaff.includes(shift.staff.name)) {
            return false;
          }

          const bookingStart =
            booking.date.getUTCHours() * 60 +
            booking.date.getUTCMinutes();

          const bookingEnd = bookingStart + booking.duration;

          return startMinutes < bookingEnd && endMinutes > bookingStart;
        });

        return !hasConflictingBooking;
      })
      .map((shift) => ({
        id: shift.staff.id,
        name: shift.staff.name,
      }));

    const groups = combinations(availableStaff, people);

    if (groups.length > 0) {
      slots.push({
        time: minutesToTime(startMinutes),
        availableStaff,
        groups,
      });
    }
  }

  return NextResponse.json({
    date: dateValue,
    duration,
    people,
    staff: requestedStaff,
    isClosed: false,
    closedReason: null,
    openTime: businessHour.openTime,
    closeTime: businessHour.closeTime,
    slots,
  });
}