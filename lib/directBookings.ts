import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail } from "@/lib/bookingConfirmationEmail";
import {
  acquireBookingLocks,
  buildBookingNo,
  checkRequestedBookingAvailability,
} from "@/lib/serverBookingAvailability";

export class DirectBookingConflictError extends Error {
  constructor(message = "指定された日時は予約できません。") {
    super(message);
    this.name = "DirectBookingConflictError";
  }
}

export type CreateDirectBookingInput = {
  storeId: string;
  serviceMenuId: string;
  customer: string;
  email: string;
  phone: string;
  memo?: string;
  bookingDate: Date;
  dateValue: string;
  startTime: string;
  duration: number;
  people: number;
  staffNames: string[];
  staffLabel: string;
  menuName: string;
  amount: number;
};

export async function createDirectBooking(input: CreateDirectBookingInput) {
  const booking = await prisma.$transaction(
    async (tx) => {
      await acquireBookingLocks(
        tx,
        input.storeId,
        input.dateValue,
        input.staffNames
      );

      const availability = await checkRequestedBookingAvailability(tx, {
        storeId: input.storeId,
        dateValue: input.dateValue,
        startTime: input.startTime,
        duration: input.duration,
        people: input.people,
        staffNames: input.staffNames,
      });

      if (!availability.ok) {
        throw new DirectBookingConflictError(availability.reason);
      }

      return tx.booking.create({
        data: {
          storeId: input.storeId,
          serviceMenuId: input.serviceMenuId,
          bookingNo: buildBookingNo(),
          customer: input.customer,
          email: input.email,
          phone: input.phone,
          memo: input.memo,
          date: input.bookingDate,
          duration: input.duration,
          people: input.people,
          staff: input.staffLabel,
          menu: input.menuName,
          amount: input.amount,
          deposit: 0,
          status: "CONFIRMED",
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    }
  );

  const store = await prisma.store.findUnique({
    where: {
      id: input.storeId,
    },
    select: {
      name: true,
      timezone: true,
      phone: true,
    },
  });

  if (store) {
    try {
      await sendBookingConfirmationEmail(booking, store);
    } catch {
      // 予約確定自体は成功しているため、メール送信失敗で処理を止めない
    }
  }

  return booking;
}

