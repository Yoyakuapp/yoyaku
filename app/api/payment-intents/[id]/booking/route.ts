import { NextResponse } from "next/server";

import {
  confirmPaidPaymentIntent,
  isPaymentBookingConflictError,
} from "@/lib/paymentBookings";
import { getStripe } from "@/lib/stripe";
import { getPaymentIntentStoreId } from "@/lib/stripePaymentMetadata";

type PaymentIntentBookingRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: PaymentIntentBookingRouteContext
) {
  const { id } = await context.params;

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(id);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          error: "決済が完了していません。",
        },
        {
          status: 409,
        }
      );
    }

    const storeId = getPaymentIntentStoreId(paymentIntent.metadata);

    if (!storeId) {
      return NextResponse.json(
        {
          error: "決済情報の店舗を確認できません。",
        },
        {
          status: 409,
        }
      );
    }

    const booking = await confirmPaidPaymentIntent(paymentIntent.id, storeId);

    return NextResponse.json(booking);
  } catch (error) {
    if (isPaymentBookingConflictError(error)) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "予約を確定できませんでした。",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "予約確認に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
