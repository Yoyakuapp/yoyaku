import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

const fieldLabels: Record<string, string> = {
  name: "店舗名",
  phone: "電話番号",
  email: "メールアドレス",
  address: "住所",
  postalCode: "郵便番号",
  city: "市区町村",
};

const updateStoreSchema = z.object({
  name: z.string().trim().min(1, "店舗名を入力してください。"),
  phone: z.string().trim().max(32).nullable(),
  email: z
    .string()
    .trim()
    .email("メールアドレスの形式が正しくありません。")
    .nullable()
    .or(z.literal("").transform(() => null)),
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
    const firstIssue = parsed.error.issues[0];
    const fieldLabel = fieldLabels[String(firstIssue?.path[0] ?? "")];
    const detail = firstIssue?.message ?? "入力内容を確認してください。";

    return NextResponse.json(
      {
        error: fieldLabel ? `${fieldLabel}: ${detail}` : detail,
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