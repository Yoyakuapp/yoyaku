import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

const updateStoreSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().max(32).nullable(),
  email: z.string().trim().email().nullable().or(z.literal("").transform(() => null)),
  address: z.string().trim().max(255).nullable(),
  postalCode: z.string().trim().max(16).nullable(),
  city: z.string().trim().max(120).nullable(),
});

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  return NextResponse.json({
    name: store.name,
    phone: store.phone,
    email: store.email,
    address: store.address,
    postalCode: store.postalCode,
    city: store.city,
  });
}

export async function PUT(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const json = await request.json();
  const parsed = updateStoreSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "店舗情報の入力内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const updated = await prisma.store.update({
    where: {
      id: store.id,
    },
    data: parsed.data,
    select: {
      name: true,
      phone: true,
      email: true,
      address: true,
      postalCode: true,
      city: true,
    },
  });

  return NextResponse.json(updated);
}