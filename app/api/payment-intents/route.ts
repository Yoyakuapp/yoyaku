import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  createBookingRequestSchema,
  normalizeBookingRequest,
} from "@/lib/bookingRequest";
import { getDefaultStore, isStoreResolutionError } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { buildBookingPaymentIntentMetadata } from "@/lib/stripePaymentMetadata";
import {
  acquireBookingLocks,
  checkRequestedBookingAvailability,
  isTransactionConflict,
} from "@/lib/serverBookingAvailability";

class PaymentIntentConflictError extends Error {
  constructor(message = "指定された日時は予約できません。") {
    super(message);
    this.name = "PaymentIntentConflictError";
  }
}

function jsonError(message: string, status: 400 | 409 | 500) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request) {
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
    const store = await getDefaultStore();

    const result = await prisma.$transaction(
      async (tx) => {
        await acquireBookingLocks(
          tx,
          store.id,
          normalized.bookingDate.dateValue,
          normalized.staffNames
        );

        const availability = await checkRequestedBookingAvailability(tx, {
          storeId: store.id,
          dateValue: normalized.bookingDate.dateValue,
          startTime: normalized.bookingDate.timeValue,
          duration: parsed.data.duration,
          people: parsed.data.people,
          staffNames: normalized.staffNames,
        });

        if (!availability.ok) {
          throw new PaymentIntentConflictError(availability.reason);
        }

        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create({
          amount: normalized.deposit,
          currency: "jpy",
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: buildBookingPaymentIntentMetadata({
            storeId: store.id,
            bookingDate: normalized.bookingDate.dateValue,
            bookingTime: normalized.bookingDate.timeValue,
            duration: parsed.data.duration,
            people: parsed.data.people,
          }),
        });

        if (!paymentIntent.client_secret) {
          throw new Error("PaymentIntent client secret missing");
        }

        await tx.bookingPaymentAttempt.create({
          data: {
            storeId: store.id,
            stripePaymentIntentId: paymentIntent.id,
            customer: parsed.data.customer,
            email: parsed.data.email,
            phone: parsed.data.phone,
            memo: parsed.data.memo,
            date: normalized.bookingDate.bookingDate,
            duration: parsed.data.duration,
            people: parsed.data.people,
            staff: normalized.staffLabel,
            menu: normalized.menu,
            amount: normalized.totalPrice,
            deposit: normalized.deposit,
            status: "CREATED",
          },
        });

        return {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: normalized.totalPrice,
          deposit: normalized.deposit,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return jsonError(error.message, 500);
    }

    if (error instanceof PaymentIntentConflictError) {
      return jsonError(error.message, 409);
    }

    if (isTransactionConflict(error)) {
      return jsonError(
        "予約処理が混み合っています。もう一度お試しください。",
        409
      );
    }

    return jsonError("決済の準備に失敗しました。", 500);
  }
}
