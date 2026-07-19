import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  createBookingRequestSchema,
  normalizeBookingRequest,
} from "@/lib/bookingRequest";
import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import { calculatePlatformFee } from "@/lib/platformFee";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { buildBookingPaymentIntentMetadata } from "@/lib/stripePaymentMetadata";
import {
  getServiceMenuBookingPrice,
  getServiceMenuForBooking,
  ServiceMenuError,
} from "@/lib/serviceMenus";
import {
  acquireBookingLocks,
  checkRequestedBookingAvailability,
  isTransactionConflict,
} from "@/lib/serverBookingAvailability";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

class PaymentIntentConflictError extends Error {
  constructor(message = "指定された日時は予約できません。") {
    super(message);
    this.name = "PaymentIntentConflictError";
  }
}

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

    if (!store.allowYoyakuBooking || !store.requiresDeposit) {
      return jsonError("この店舗は予約金決済を利用していません。", 400);
    }

    if (!store.stripeAccountId || !store.stripeChargesEnabled) {
      return jsonError(
        "この店舗はオンライン決済の準備が完了していません。電話またはWhatsAppでご連絡ください。",
        400
      );
    }

    const stripeAccountId = store.stripeAccountId;

    const menu = await getServiceMenuForBooking(prisma, {
      storeId: store.id,
      menuId: parsed.data.menuId,
      duration: parsed.data.duration,
    });
    const menuPrice = getServiceMenuBookingPrice(menu);
    const platformFeeAmount = calculatePlatformFee(menuPrice.deposit);

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
          duration: menu.durationMinutes,
          people: parsed.data.people,
          staffNames: normalized.staffNames,
        });

        if (!availability.ok) {
          throw new PaymentIntentConflictError(availability.reason);
        }

        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create(
          {
            amount: menuPrice.deposit,
            currency: menu.currency.toLowerCase(),
            automatic_payment_methods: {
              enabled: true,
            },
            application_fee_amount: platformFeeAmount,
            metadata: buildBookingPaymentIntentMetadata({
              storeId: store.id,
              serviceMenuId: menu.id,
              bookingDate: normalized.bookingDate.dateValue,
              bookingTime: normalized.bookingDate.timeValue,
              duration: menu.durationMinutes,
              people: parsed.data.people,
            }),
          },
          {
            stripeAccount: stripeAccountId,
          }
        );

        if (!paymentIntent.client_secret) {
          throw new Error("PaymentIntent client secret missing");
        }

        await tx.bookingPaymentAttempt.create({
          data: {
            storeId: store.id,
            serviceMenuId: menu.id,
            stripePaymentIntentId: paymentIntent.id,
            customer: parsed.data.customer,
            email: parsed.data.email,
            phone: parsed.data.phone,
            memo: parsed.data.memo,
            date: normalized.bookingDate.bookingDate,
            duration: menu.durationMinutes,
            people: parsed.data.people,
            staff: normalized.staffLabel,
            menu: menu.name,
            amount: menuPrice.totalPrice,
            deposit: menuPrice.deposit,
            status: "CREATED",
            platformFeeAmount,
            paymentStripeAccountId: stripeAccountId,
          },
        });

        return {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: menuPrice.totalPrice,
          deposit: menuPrice.deposit,
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
      return jsonError(error.message, error.status === 404 ? 404 : 500);
    }

    if (error instanceof PaymentIntentConflictError) {
      return jsonError(error.message, 409);
    }

    if (error instanceof ServiceMenuError) {
      return jsonError(error.message, 400);
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
