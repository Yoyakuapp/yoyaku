import { NextResponse } from "next/server";

import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import { getPlatformSettings } from "@/lib/platformSettings";
import { prisma } from "@/lib/prisma";
import {
  findNextAvailableDates,
  getAvailabilityForDate,
  getPartnerAvailability,
  getUtcDayRange,
} from "@/lib/serverBookingAvailability";
import { getServiceMenuForBooking, ServiceMenuError } from "@/lib/serviceMenus";
import { getAcceptedPartnerStoreIds } from "@/lib/storeLinks";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;
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
    const store = await getPublicStoreBySlug(slug);
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

    if (availability.slots.length > 0) {
      return NextResponse.json(availability);
    }

    const nextAvailable = await findNextAvailableDates(prisma, {
      storeId: store.id,
      afterDateValue: dateValue,
      duration: menu.durationMinutes,
      people,
      requestedStaff,
    });

    const settings = await getPlatformSettings();
    let partnerAvailability: Awaited<ReturnType<typeof getPartnerAvailability>> = [];

    if (settings.storeNetworkEnabled) {
      const [sisterIds, regionalIds] = await Promise.all([
        getAcceptedPartnerStoreIds(store.id, "SISTER"),
        getAcceptedPartnerStoreIds(store.id, "REGIONAL"),
      ]);

      const partnerStoreIds = Array.from(
        new Set([...sisterIds, ...regionalIds])
      );

      partnerAvailability = await getPartnerAvailability(prisma, {
        storeIds: partnerStoreIds,
        dateValue,
        duration: menu.durationMinutes,
        people,
      });
    }

    return NextResponse.json({
      ...availability,
      nextAvailable,
      partnerAvailability,
    });
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
