import { NextResponse } from "next/server";

import {
  createBookingRequestSchema,
  normalizeBookingRequest,
} from "@/lib/bookingRequest";
import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import {
  DirectBookingConflictError,
  createDirectBooking,
} from "@/lib/directBookings";
import { prisma } from "@/lib/prisma";
import {
  getServiceMenuBookingPrice,
  getServiceMenuForBooking,
  ServiceMenuError,
} from "@/lib/serviceMenus";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function jsonError(message: string, status: 400 | 404 | 409 | 500) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return jsonError("リクエスト内容が正しくありません。", 400);
  }

  const parsed = createBookingRequestSchema.safeParse(json);

  if (!parsed.success) {
    return jsonError("予約内容の入力が正しくありません。", 400);
  }

  const normalized = normalizeBookingRequest(parsed.data);

  if (!normalized) {
    return jsonError("予約日時または担当者が正しくありません。", 400);
  }

  try {
    const store = await getPublicStoreBySlug(slug);

    if (!store.allowYoyakuBooking) {
      return jsonError("この店舗はYoyaku上での予約を受け付けていません。", 400);
    }

    if (store.requiresDeposit) {
      return jsonError(
        "この店舗は予約時にデポジットのお支払いが必要です。現在準備中のため、電話またはWhatsAppでご連絡ください。",
        400
      );
    }

    const menu = await getServiceMenuForBooking(prisma, {
      storeId: store.id,
      menuId: parsed.data.menuId,
      duration: parsed.data.duration,
    });
    const menuPrice = getServiceMenuBookingPrice(menu);

    const booking = await createDirectBooking({
      storeId: store.id,
      serviceMenuId: menu.id,
      customer: parsed.data.customer,
      email: parsed.data.email,
      phone: parsed.data.phone,
      memo: parsed.data.memo,
      bookingDate: normalized.bookingDate.bookingDate,
      dateValue: normalized.bookingDate.dateValue,
      startTime: normalized.bookingDate.timeValue,
      duration: menu.durationMinutes,
      people: parsed.data.people,
      staffNames: normalized.staffNames,
      staffLabel: normalized.staffLabel,
      menuName: menu.name,
      amount: menuPrice.totalPrice,
    });

    return NextResponse.json({
      bookingNo: booking.bookingNo,
      status: booking.status,
    });
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return jsonError(error.message, error.status === 404 ? 404 : 500);
    }

    if (error instanceof ServiceMenuError) {
      return jsonError(error.message, 400);
    }

    if (error instanceof DirectBookingConflictError) {
      return jsonError(error.message, 409);
    }

    return jsonError("予約の作成に失敗しました。", 500);
  }
}
