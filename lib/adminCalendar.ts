import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getMondayBasedDayOfWeek, timeToMinutes } from "@/lib/serverBookingAvailability";

export type CalendarDayShift = {
  staffId: string;
  staffName: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
};

export type CalendarDay = {
  date: string;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isClosed: boolean;
  closedReason: string | null;
  openTime: string | null;
  closeTime: string | null;
  isOverride: boolean;
  shifts: CalendarDayShift[];
};

export type MonthCalendar = {
  days: CalendarDay[];
  staff: { id: string; name: string }[];
};

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isValidMonthValue(monthValue: string) {
  return /^\d{4}-\d{2}$/.test(monthValue) && !Number.isNaN(new Date(`${monthValue}-01T00:00:00.000Z`).getTime());
}

export function getMonthRange(monthValue: string) {
  const firstOfMonth = new Date(`${monthValue}-01T00:00:00.000Z`);
  const firstOfNextMonth = new Date(firstOfMonth);
  firstOfNextMonth.setUTCMonth(firstOfNextMonth.getUTCMonth() + 1);

  const startWeekday = getMondayBasedDayOfWeek(firstOfMonth);
  const gridStart = addDays(firstOfMonth, -startWeekday);

  const lastOfMonth = addDays(firstOfNextMonth, -1);
  const endWeekday = getMondayBasedDayOfWeek(lastOfMonth);
  const gridEndExclusive = addDays(lastOfMonth, 6 - endWeekday + 1);

  return { firstOfMonth, firstOfNextMonth, gridStart, gridEndExclusive };
}

export async function getMonthCalendar(
  storeId: string,
  monthValue: string
): Promise<MonthCalendar> {
  const { firstOfMonth, firstOfNextMonth, gridStart, gridEndExclusive } =
    getMonthRange(monthValue);

  const [weeklyHours, overrides, holidays, staffList, shifts] = await Promise.all([
    prisma.businessHour.findMany({
      where: {
        storeId,
      },
    }),
    prisma.businessHourOverride.findMany({
      where: {
        storeId,
        date: {
          gte: gridStart,
          lt: gridEndExclusive,
        },
      },
    }),
    prisma.holiday.findMany({
      where: {
        storeId,
        date: {
          gte: gridStart,
          lt: gridEndExclusive,
        },
      },
    }),
    prisma.staff.findMany({
      where: {
        storeId,
        active: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.shift.findMany({
      where: {
        date: {
          gte: gridStart,
          lt: gridEndExclusive,
        },
        staff: {
          storeId,
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
  ]);

  const weeklyMap = new Map(weeklyHours.map((hour) => [hour.dayOfWeek, hour]));
  const overrideMap = new Map(overrides.map((item) => [formatDateKey(item.date), item]));
  const holidayMap = new Map(holidays.map((item) => [formatDateKey(item.date), item]));
  const shiftMap = new Map<string, CalendarDayShift[]>();

  for (const shift of shifts) {
    const key = formatDateKey(shift.date);
    const list = shiftMap.get(key) ?? [];

    list.push({
      staffId: shift.staffId,
      staffName: shift.staff.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isWorking: shift.isWorking,
    });

    shiftMap.set(key, list);
  }

  const todayKey = formatDateKey(new Date());
  const days: CalendarDay[] = [];

  for (
    let cursor = new Date(gridStart);
    cursor < gridEndExclusive;
    cursor = addDays(cursor, 1)
  ) {
    const dateKey = formatDateKey(cursor);
    const dayOfWeek = getMondayBasedDayOfWeek(cursor);
    const holiday = holidayMap.get(dateKey);
    const override = overrideMap.get(dateKey);
    const weekly = weeklyMap.get(dayOfWeek);

    let isClosed = true;
    let closedReason: string | null = null;
    let openTime: string | null = weekly?.openTime ?? null;
    let closeTime: string | null = weekly?.closeTime ?? null;
    let isOverride = false;

    if (holiday) {
      isClosed = true;
      closedReason = holiday.reason;
    } else if (override) {
      isClosed = false;
      openTime = override.openTime;
      closeTime = override.closeTime;
      isOverride = true;
    } else if (weekly && !weekly.isClosed) {
      isClosed = false;
      openTime = weekly.openTime;
      closeTime = weekly.closeTime;
    } else {
      isClosed = true;
      closedReason = "定休日";
    }

    days.push({
      date: dateKey,
      dayOfWeek,
      isCurrentMonth: cursor >= firstOfMonth && cursor < firstOfNextMonth,
      isToday: dateKey === todayKey,
      isClosed,
      closedReason,
      openTime,
      closeTime,
      isOverride,
      shifts: (shiftMap.get(dateKey) ?? []).sort((a, b) =>
        a.staffName.localeCompare(b.staffName, "ja")
      ),
    });
  }

  return {
    days,
    staff: staffList.map((person) => ({
      id: person.id,
      name: person.name,
    })),
  };
}

const calendarDayShiftInputSchema = z.object({
  staffId: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isWorking: z.boolean(),
});

export const saveCalendarDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isClosed: z.boolean(),
  closedReason: z.string().trim().max(60).optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  shifts: z.array(calendarDayShiftInputSchema).default([]),
});

export type SaveCalendarDayInput = z.infer<typeof saveCalendarDaySchema>;

export class CalendarDayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalendarDayError";
  }
}

export async function saveCalendarDay(storeId: string, input: SaveCalendarDayInput) {
  if (!input.isClosed && timeToMinutes(input.openTime) >= timeToMinutes(input.closeTime)) {
    throw new CalendarDayError("開始時間は終了時間より前に設定してください。");
  }

  const staffIds = [...new Set(input.shifts.map((shift) => shift.staffId))];

  if (staffIds.length > 0) {
    const ownedStaffCount = await prisma.staff.count({
      where: {
        id: {
          in: staffIds,
        },
        storeId,
      },
    });

    if (ownedStaffCount !== staffIds.length) {
      throw new CalendarDayError("この店舗の施術者のみ設定できます。");
    }
  }

  const targetDate = new Date(`${input.date}T00:00:00.000Z`);

  await prisma.$transaction(async (tx) => {
    await tx.holiday.deleteMany({
      where: {
        storeId,
        date: targetDate,
      },
    });

    if (input.isClosed) {
      await tx.holiday.create({
        data: {
          storeId,
          date: targetDate,
          reason: input.closedReason?.trim() || "臨時休業",
        },
      });

      await tx.businessHourOverride.deleteMany({
        where: {
          storeId,
          date: targetDate,
        },
      });
    } else {
      await tx.businessHourOverride.upsert({
        where: {
          storeId_date: {
            storeId,
            date: targetDate,
          },
        },
        update: {
          openTime: input.openTime,
          closeTime: input.closeTime,
        },
        create: {
          storeId,
          date: targetDate,
          openTime: input.openTime,
          closeTime: input.closeTime,
        },
      });
    }

    for (const shift of input.shifts) {
      await tx.shift.upsert({
        where: {
          staffId_date: {
            staffId: shift.staffId,
            date: targetDate,
          },
        },
        update: {
          startTime: shift.startTime,
          endTime: shift.endTime,
          isWorking: shift.isWorking,
        },
        create: {
          staffId: shift.staffId,
          date: targetDate,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isWorking: shift.isWorking,
        },
      });
    }
  });
}
