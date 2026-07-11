import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdminApiSession();

  if (authError) {
    return authError;
  }

  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  await request.body?.cancel();

  return NextResponse.json(
    {
      error: "予約作成にはPaymentIntentを使用してください。",
    },
    {
      status: 400,
    }
  );
}
