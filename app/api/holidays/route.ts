import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await requireAdminApiSession();

  if (authError) {
    return authError;
  }

  const holidays = await prisma.holiday.findMany({
    orderBy: {
      date: "asc",
    },
  });

  return NextResponse.json(holidays);
}

export async function POST(request: Request) {
  const authError = await requireAdminApiSession();

  if (authError) {
    return authError;
  }

  const body = await request.json();

  const holiday = await prisma.holiday.create({
    data: {
      date: new Date(body.date),
      reason: body.reason ?? "休業日",
    },
  });

  return NextResponse.json(holiday, { status: 201 });
}
