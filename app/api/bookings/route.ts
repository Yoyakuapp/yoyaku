import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bookings = await prisma.booking.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const body = await request.json();

  const booking = await prisma.booking.create({
    data: {
      bookingNo: `YOYAKU-${Date.now()}`,
      customer: body.customer,
      email: body.email,
      phone: body.phone,
      memo: body.memo ?? "",
      date: new Date(body.date),
      duration: body.duration,
      people: body.people,
      staff: body.staff,
      menu: body.menu,
      amount: body.amount,
      deposit: body.deposit,
      status: "PENDING",
    },
  });

  return NextResponse.json(booking);
}