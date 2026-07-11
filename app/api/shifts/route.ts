import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiSession } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

const shiftSchema = z.object({
  staffId: z.string().min(1),
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isWorking: z.boolean(),
});

const saveShiftsSchema = z.object({
  shifts: z.array(shiftSchema),
});

export async function GET(request: Request) {
  const authError = await requireAdminApiSession();

  if (authError) {
    return authError;
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      {
        error: "日付が指定されていません。",
      },
      {
        status: 400,
      }
    );
  }

  const targetDate = new Date(`${date}T00:00:00.000Z`);

  const shifts = await prisma.shift.findMany({
    where: {
      date: targetDate,
    },
    include: {
      staff: true,
    },
    orderBy: {
      staff: {
        createdAt: "asc",
      },
    },
  });

  return NextResponse.json(shifts);
}

export async function PUT(request: Request) {
  const authError = await requireAdminApiSession();

  if (authError) {
    return authError;
  }

  const json = await request.json();
  const parsed = saveShiftsSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "シフトの入力内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  await prisma.$transaction(
    parsed.data.shifts.map((shift) =>
      prisma.shift.upsert({
        where: {
          staffId_date: {
            staffId: shift.staffId,
            date: new Date(shift.date),
          },
        },
        update: {
          startTime: shift.startTime,
          endTime: shift.endTime,
          isWorking: shift.isWorking,
        },
        create: {
          staffId: shift.staffId,
          date: new Date(shift.date),
          startTime: shift.startTime,
          endTime: shift.endTime,
          isWorking: shift.isWorking,
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
  });
}
