import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const updateBookingSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
  ]),
});

type BookingRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: BookingRouteContext
) {
  const { id } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: {
      id,
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
  const { id } = await context.params;
  const json = await request.json();

  const parsed = updateBookingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "予約状態が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const existingBooking = await prisma.booking.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
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

  const booking = await prisma.booking.update({
    where: {
      id,
    },
    data: {
      status: parsed.data.status,
    },
  });

  return NextResponse.json(booking);
}
