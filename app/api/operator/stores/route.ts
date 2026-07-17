import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return NextResponse.json(
      {
        error: "パスワードが正しくありません。",
      },
      {
        status: 401,
      }
    );
  }

  const q = searchParams.get("q")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";

  const where: Prisma.StoreWhereInput = {
    ...(country ? { country } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const stores = await prisma.store.findMany({
    where,
    orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      city: true,
      address: true,
      isActive: true,
      isPublished: true,
      allowPhoneBooking: true,
      allowWhatsappBooking: true,
      allowYoyakuBooking: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ stores });
}
