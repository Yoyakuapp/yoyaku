import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
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
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
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
      staff: {
        storeId: store.id,
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
  });

  return NextResponse.json(shifts);
}

export async function PUT(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
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

  const staffIds = [...new Set(parsed.data.shifts.map((shift) => shift.staffId))];
  const ownedStaffCount = await prisma.staff.count({
    where: {
      id: {
        in: staffIds,
      },
      storeId: store.id,
    },
  });

  if (ownedStaffCount !== staffIds.length) {
    return NextResponse.json(
      {
        error: "この店舗の施術者のみシフトを保存できます。",
      },
      {
        status: 403,
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
