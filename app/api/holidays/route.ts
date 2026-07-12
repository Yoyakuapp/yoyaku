import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const holidays = await prisma.holiday.findMany({
    where: {
      storeId: store.id,
    },
    orderBy: {
      date: "asc",
    },
  });

  return NextResponse.json(holidays);
}

export async function POST(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const body = await request.json();

  const holiday = await prisma.holiday.create({
    data: {
      storeId: store.id,
      date: new Date(body.date),
      reason: body.reason ?? "休業日",
    },
  });

  return NextResponse.json(holiday, { status: 201 });
}
