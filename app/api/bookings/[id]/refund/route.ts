import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type BookingRefundRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: BookingRefundRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: {
      id,
      storeId: store.id,
    },
  });

  if (!booking) {
    return NextResponse.json(
      {
        error: "予約が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  if (!booking.stripePaymentIntentId) {
    return NextResponse.json(
      {
        error: "返金対象の決済がありません。",
      },
      {
        status: 400,
      }
    );
  }

  if (booking.refundedAt) {
    return NextResponse.json(
      {
        error: "この予約はすでに返金済みです。",
      },
      {
        status: 409,
      }
    );
  }

  try {
    const refund = await getStripe().refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      amount: booking.deposit,
      reason: "requested_by_customer",
      metadata: {
        bookingId: booking.id,
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
        storeId: store.id,
      },
      data: {
        stripeRefundId: refund.id,
        refundedAt: new Date(),
        status: "CANCELLED",
        paymentAttempt: {
          update: {
            status: "REFUNDED",
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch {
    return NextResponse.json(
      {
        error: "返金処理に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
