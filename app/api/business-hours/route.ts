import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const businessHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isClosed: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const updateBusinessHoursSchema = z.object({
  hours: z.array(businessHourSchema).length(7),
});

const defaultHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  isClosed: dayOfWeek === 6,
  openTime: "10:00",
  closeTime: "20:00",
}));

export async function GET() {
  const existingHours = await prisma.businessHour.findMany({
    orderBy: {
      dayOfWeek: "asc",
    },
  });

  if (existingHours.length === 7) {
    return NextResponse.json(existingHours);
  }

  await prisma.$transaction(
    defaultHours.map((hour) =>
      prisma.businessHour.upsert({
        where: {
          dayOfWeek: hour.dayOfWeek,
        },
        update: {},
        create: hour,
      })
    )
  );

  const hours = await prisma.businessHour.findMany({
    orderBy: {
      dayOfWeek: "asc",
    },
  });

  return NextResponse.json(hours);
}

export async function PUT(request: Request) {
  const json = await request.json();
  const parsed = updateBusinessHoursSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "営業時間の入力内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.$transaction(
    parsed.data.hours.map((hour) =>
      prisma.businessHour.upsert({
        where: {
          dayOfWeek: hour.dayOfWeek,
        },
        update: {
          isClosed: hour.isClosed,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        },
        create: hour,
      })
    )
  );

  const hours = await prisma.businessHour.findMany({
    orderBy: {
      dayOfWeek: "asc",
    },
  });

  return NextResponse.json(hours);
}