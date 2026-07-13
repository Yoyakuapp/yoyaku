import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import {
  assertValidBookingTransition,
  BookingLifecycleError,
} from "@/lib/bookingLifecycle";
import { parseBookingDate, parseStaffNames } from "@/lib/bookingRequest";
import { prisma } from "@/lib/prisma";
import {
  acquireBookingLocks,
  checkRequestedBookingAvailability,
  isTransactionConflict,
  normalizeStaffGroup,
} from "@/lib/serverBookingAvailability";

const updateBookingSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
  ]),
});

const rescheduleBookingSchema = z.object({
  date: z.string().datetime({ offset: true }),
  staff: z.string().trim().min(1).max(200),
});

const MAX_TRANSACTION_RETRIES = 3;

class BookingRescheduleError extends Error {
  constructor(message = "指定された日時は予約できません。") {
    super(message);
    this.name = "BookingRescheduleError";
  }
}

type BookingRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: BookingRouteContext
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

  return NextResponse.json(booking);
}

export async function PATCH(
  request: Request,
  context: BookingRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "リクエスト内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const parsedStatus = updateBookingSchema.safeParse(json);

  if (parsedStatus.success) {
    const existingBooking = await prisma.booking.findUnique({
      where: {
        id,
        storeId: store.id,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingBooking) {
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
      assertValidBookingTransition(
        existingBooking.status,
        parsedStatus.data.status
      );

      const booking = await prisma.booking.update({
        where: {
          id,
          storeId: store.id,
        },
        data: {
          status: parsedStatus.data.status,
        },
      });

      return NextResponse.json(booking);
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

      throw error;
    }
  }

  const parsedReschedule = rescheduleBookingSchema.safeParse(json);

  if (!parsedReschedule.success) {
    return NextResponse.json(
      {
        error: "予約変更内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const bookingDate = parseBookingDate(parsedReschedule.data.date);
  const staffNames = parseStaffNames(parsedReschedule.data.staff);

  if (!bookingDate || !staffNames) {
    return NextResponse.json(
      {
        error: "予約日時または担当者が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      const booking = await prisma.$transaction(
        async (tx) => {
          const existingBooking = await tx.booking.findUnique({
            where: {
              id,
              storeId: store.id,
            },
            select: {
              id: true,
              storeId: true,
              status: true,
              duration: true,
              people: true,
            },
          });

          if (!existingBooking) {
            throw new BookingRescheduleError("予約が見つかりません。");
          }

          if (
            existingBooking.status !== "PENDING" &&
            existingBooking.status !== "CONFIRMED"
          ) {
            throw new BookingRescheduleError(
              "この予約状態では日時を変更できません。"
            );
          }

          if (staffNames.length !== existingBooking.people) {
            throw new BookingRescheduleError(
              "予約人数分の担当者を選択してください。"
            );
          }

          await acquireBookingLocks(
            tx,
            existingBooking.storeId,
            bookingDate.dateValue,
            staffNames
          );

          const availability = await checkRequestedBookingAvailability(tx, {
            storeId: existingBooking.storeId,
            dateValue: bookingDate.dateValue,
            startTime: bookingDate.timeValue,
            duration: existingBooking.duration,
            people: existingBooking.people,
            staffNames,
            ignoreBookingId: existingBooking.id,
          });

          if (!availability.ok) {
            throw new BookingRescheduleError(availability.reason);
          }

          return tx.booking.update({
            where: {
              id,
              storeId: store.id,
            },
            data: {
              date: bookingDate.bookingDate,
              staff: normalizeStaffGroup(staffNames).replace(/\+/g, " + "),
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        }
      );

      return NextResponse.json(booking);
    } catch (error) {
      if (error instanceof BookingRescheduleError) {
        return NextResponse.json(
          {
            error: error.message,
          },
          {
            status: error.message === "予約が見つかりません。" ? 404 : 409,
          }
        );
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

  return NextResponse.json(
    {
      error: "予約変更が混み合っています。もう一度お試しください。",
    },
    {
      status: 409,
    }
  );
}
