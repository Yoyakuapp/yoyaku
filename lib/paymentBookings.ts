import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  acquireBookingLocks,
  buildBookingNo,
  checkRequestedBookingAvailability,
  isTransactionConflict,
} from "@/lib/serverBookingAvailability";

const MAX_TRANSACTION_RETRIES = 3;

class PaymentBookingConflictError extends Error {
  constructor(message = "指定された日時は予約できません。") {
    super(message);
    this.name = "PaymentBookingConflictError";
  }
}

export function isPaymentBookingConflictError(error: unknown) {
  return error instanceof PaymentBookingConflictError;
}

export async function confirmPaidPaymentIntent(paymentIntentId: string) {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existingBooking = await tx.booking.findUnique({
            where: {
              stripePaymentIntentId: paymentIntentId,
            },
          });

          if (existingBooking) {
            return existingBooking;
          }

          const paymentAttempt = await tx.bookingPaymentAttempt.findUnique({
            where: {
              stripePaymentIntentId: paymentIntentId,
            },
          });

          if (!paymentAttempt) {
            throw new PaymentBookingConflictError("決済情報が見つかりません。");
          }

          const dateValue = paymentAttempt.date.toISOString().slice(0, 10);
          const startTime = `${String(paymentAttempt.date.getUTCHours()).padStart(
            2,
            "0"
          )}:${String(paymentAttempt.date.getUTCMinutes()).padStart(2, "0")}`;
          const staffNames = paymentAttempt.staff
            .split("+")
            .map((name) => name.trim())
            .filter(Boolean);

          await acquireBookingLocks(tx, dateValue, staffNames);

          const availability = await checkRequestedBookingAvailability(tx, {
            dateValue,
            startTime,
            duration: paymentAttempt.duration,
            people: paymentAttempt.people,
            staffNames,
            ignorePaymentIntentId: paymentIntentId,
          });

          if (!availability.ok) {
            await tx.bookingPaymentAttempt.update({
              where: {
                id: paymentAttempt.id,
              },
              data: {
                status: "FAILED",
              },
            });

            throw new PaymentBookingConflictError(availability.reason);
          }

          const booking = await tx.booking.create({
            data: {
              bookingNo: buildBookingNo(),
              customer: paymentAttempt.customer,
              email: paymentAttempt.email,
              phone: paymentAttempt.phone,
              memo: paymentAttempt.memo,
              date: paymentAttempt.date,
              duration: paymentAttempt.duration,
              people: paymentAttempt.people,
              staff: paymentAttempt.staff,
              menu: paymentAttempt.menu,
              amount: paymentAttempt.amount,
              deposit: paymentAttempt.deposit,
              status: "CONFIRMED",
              stripePaymentIntentId: paymentIntentId,
            },
          });

          await tx.bookingPaymentAttempt.update({
            where: {
              id: paymentAttempt.id,
            },
            data: {
              status: "SUCCEEDED",
              bookingId: booking.id,
            },
          });

          return booking;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        }
      );
    } catch (error) {
      if (isPaymentBookingConflictError(error)) {
        throw error;
      }

      if (
        (isTransactionConflict(error) ||
          (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002")) &&
        attempt < MAX_TRANSACTION_RETRIES
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new PaymentBookingConflictError(
    "予約処理が混み合っています。もう一度お試しください。"
  );
}

export async function markPaymentIntentFailed(paymentIntentId: string) {
  await prisma.bookingPaymentAttempt.updateMany({
    where: {
      stripePaymentIntentId: paymentIntentId,
      bookingId: null,
    },
    data: {
      status: "FAILED",
    },
  });
}
