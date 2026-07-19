import { NextResponse } from "next/server";

import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import {
  confirmPaidPaymentIntent,
  isPaymentBookingConflictError,
} from "@/lib/paymentBookings";
import { getStripe } from "@/lib/stripe";
import { getPaymentIntentStoreId } from "@/lib/stripePaymentMetadata";

type PaymentIntentBookingRouteContext = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

function jsonError(message: string, status: 404 | 409 | 500) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

export async function GET(
  _request: Request,
  context: PaymentIntentBookingRouteContext
) {
  const { slug, id } = await context.params;

  try {
    const store = await getPublicStoreBySlug(slug);

    if (!store.stripeAccountId) {
      return jsonError("この店舗の決済設定が見つかりません。", 409);
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(
      id,
      {},
      {
        stripeAccount: store.stripeAccountId,
      }
    );

    if (paymentIntent.status !== "succeeded") {
      return jsonError("決済が完了していません。", 409);
    }

    const storeId = getPaymentIntentStoreId(paymentIntent.metadata);

    if (!storeId || storeId !== store.id) {
      return jsonError("決済情報の店舗を確認できません。", 409);
    }

    const booking = await confirmPaidPaymentIntent(
      paymentIntent.id,
      storeId,
      paymentIntent.amount_received
    );

    return NextResponse.json(booking);
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return jsonError(error.message, error.status === 404 ? 404 : 500);
    }

    if (isPaymentBookingConflictError(error)) {
      return jsonError(
        error instanceof Error ? error.message : "予約を確定できませんでした。",
        409
      );
    }

    return jsonError("予約確認に失敗しました。", 500);
  }
}
