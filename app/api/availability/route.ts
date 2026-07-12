import { NextResponse } from "next/server";

import { getDefaultStore, isStoreResolutionError } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { getAvailabilityForDate, getUtcDayRange } from "@/lib/serverBookingAvailability";
import { getServiceMenuForBooking, ServiceMenuError } from "@/lib/serviceMenus";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const dateValue = searchParams.get("date");
  const menuId = searchParams.get("menuId");
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
    const store = await getDefaultStore();
    const menu = await getServiceMenuForBooking(prisma, {
      storeId: store.id,
      menuId,
      duration,
    });
    const availability = await getAvailabilityForDate(prisma, {
      storeId: store.id,
      dateValue,
      duration: menu.durationMinutes,
      people,
      requestedStaff,
    });

    return NextResponse.json(availability);
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    if (error instanceof ServiceMenuError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        }
      );
    }

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
