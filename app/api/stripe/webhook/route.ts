import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  confirmPaidPaymentIntent,
  markPaymentIntentFailed,
} from "@/lib/paymentBookings";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { getPaymentIntentStoreId } from "@/lib/stripePaymentMetadata";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "署名がありません。",
      },
      {
        status: 400,
      }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch {
    return NextResponse.json(
      {
        error: "Webhook署名を検証できません。",
      },
      {
        status: 400,
      }
    );
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const storeId = getPaymentIntentStoreId(paymentIntent.metadata);

      if (!storeId) {
        throw new Error("PaymentIntent storeId metadata missing");
      }

      await confirmPaidPaymentIntent(paymentIntent.id, storeId);
    }

    if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "payment_intent.canceled"
    ) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const storeId = getPaymentIntentStoreId(paymentIntent.metadata);

      if (!storeId) {
        throw new Error("PaymentIntent storeId metadata missing");
      }

      await markPaymentIntentFailed(paymentIntent.id, storeId);
    }
  } catch {
    return NextResponse.json(
      {
        error: "Webhook処理に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    received: true,
  });
}
