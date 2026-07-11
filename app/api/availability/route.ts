import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAvailabilityForDate, getUtcDayRange } from "@/lib/serverBookingAvailability";

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

  if (!getUtcDayRange(dateValue)) {
    return NextResponse.json(
      {
        error: "日付が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const availability = await getAvailabilityForDate(prisma, {
      dateValue,
      duration,
      people,
      requestedStaff,
    });

    return NextResponse.json(availability);
  } catch {
    return NextResponse.json(
      {
        error: "営業時間の設定が正しくありません。",
      },
      {
        status: 500,
      }
    );
  }
}
