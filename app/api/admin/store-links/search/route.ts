import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ stores: [] });
  }

  const stores = await prisma.store.findMany({
    where: {
      isActive: true,
      isPublished: true,
      id: { not: store.id },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      country: true,
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json({ stores });
}
