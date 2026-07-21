import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import {
  assertRefundableBooking,
  BookingLifecycleError,
} from "@/lib/bookingLifecycle";
import {
  calculateRefundPercent,
  parseCancellationPolicy,
} from "@/lib/cancellationPolicy";
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

  try {
    assertRefundableBooking({
      status: booking.status,
      stripePaymentIntentId: booking.stripePaymentIntentId,
      refundedAt: booking.refundedAt,
    });

    const stripePaymentIntentId = booking.stripePaymentIntentId;

    if (!stripePaymentIntentId) {
      throw new BookingLifecycleError("返金対象の決済がありません。");
    }

    const policy = parseCancellationPolicy(store.cancellationPolicy);
    const refundPercent = calculateRefundPercent(policy, booking.date);
    const refundAmount = Math.round((booking.deposit * refundPercent) / 100);

    let refundId: string | null = null;

    if (refundAmount > 0) {
      const refund = await getStripe().refunds.create(
        {
          payment_intent: stripePaymentIntentId,
          amount: refundAmount,
          reason: "requested_by_customer",
          metadata: {
            bookingId: booking.id,
          },
        },
        booking.paymentStripeAccountId
          ? {
              stripeAccount: booking.paymentStripeAccountId,
            }
          : undefined
      );

      refundId = refund.id;
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
        storeId: store.id,
      },
      data: {
        stripeRefundId: refundId,
        refundedAt: new Date(),
        refundedAmount: refundAmount,
        status: "CANCELLED",
        paymentAttempt: {
          update: {
            status: "REFUNDED",
          },
        },
      },
    });

    return NextResponse.json({
      ...updatedBooking,
      refundPercent,
      refundAmount,
    });
  } catch (error) {
    if (error instanceof BookingLifecycleError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 409,
        }
      );
    }

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
