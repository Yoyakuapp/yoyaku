import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      storeId: store.id,
    },
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
