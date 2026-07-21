import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";
import { isSupportedLocale } from "@/lib/i18n/locales";

const fieldLabels: Record<string, string> = {
  name: "店舗名",
  phone: "電話番号",
  email: "メールアドレス",
  address: "住所",
  postalCode: "郵便番号",
  city: "市区町村",
  country: "国",
  description: "紹介文",
  websiteUrl: "WEBサイトアドレス",
  whatsappNumber: "WhatsApp番号",
  cancellationPolicy: "キャンセルポリシー",
  adminLocale: "管理画面の言語",
};

function normalizeUrlValue(value: string) {
  if (!value || /^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

const phoneDigitsPattern = /^0\d{9,10}$/;

const updateStoreSchema = z.object({
  name: z.string().trim().min(1, "店舗名を入力してください。"),
  phone: z
    .string()
    .trim()
    .max(32)
    .nullable()
    .refine(
      (value) => !value || phoneDigitsPattern.test(value.replace(/-/g, "")),
      "電話番号の形式が正しくありません(例: 03-1234-5678)。"
    ),
  email: z
    .string()
    .trim()
    .email("メールアドレスの形式が正しくありません。")
    .nullable()
    .or(z.literal("").transform(() => null)),
  address: z.string().trim().max(255).nullable(),
  postalCode: z.string().trim().max(16).nullable(),
  city: z.string().trim().max(120).nullable(),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "国の形式が正しくありません。"),
  description: z.string().trim().max(500).nullable(),
  websiteUrl: z
    .string()
    .trim()
    .transform((value) => normalizeUrlValue(value))
    .pipe(z.string().url("WEBサイトアドレスの形式が正しくありません。"))
    .nullable()
    .or(z.literal("").transform(() => null)),
  whatsappNumber: z.string().trim().max(32).nullable(),
  adminLocale: z
    .string()
    .refine(isSupportedLocale, "対応していない言語です。"),
  allowPhoneBooking: z.boolean(),
  allowWhatsappBooking: z.boolean(),
  allowYoyakuBooking: z.boolean(),
  requiresDeposit: z.boolean(),
  isPublished: z.boolean(),
  cancellationPolicy: z
    .array(
      z.object({
        hoursBefore: z.number().int().min(1).max(720),
        refundPercent: z.number().int().min(0).max(100),
      })
    )
    .max(10, "キャンセルポリシーは10段階まで設定できます。")
    .nullable(),
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
    country: store.country,
    description: store.description,
    imageUrls: store.imageUrls,
    websiteUrl: store.websiteUrl,
    whatsappNumber: store.whatsappNumber,
    adminLocale: store.adminLocale,
    allowPhoneBooking: store.allowPhoneBooking,
    allowWhatsappBooking: store.allowWhatsappBooking,
    allowYoyakuBooking: store.allowYoyakuBooking,
    requiresDeposit: store.requiresDeposit,
    isPublished: store.isPublished,
    slug: store.slug,
    cancellationPolicy: store.cancellationPolicy,
  });
}

const patchStoreSchema = z.object({
  adminLocale: z
    .string()
    .refine(isSupportedLocale, "対応していない言語です。"),
});

export async function PATCH(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const json = await request.json().catch(() => null);
  const parsed = patchStoreSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "対応していない言語です。",
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
    data: {
      adminLocale: parsed.data.adminLocale,
    },
    select: {
      adminLocale: true,
    },
  });

  return NextResponse.json(updated);
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

  const { cancellationPolicy, ...rest } = parsed.data;

  const updated = await prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      ...rest,
      cancellationPolicy:
        cancellationPolicy && cancellationPolicy.length > 0
          ? cancellationPolicy
          : Prisma.DbNull,
    },
    select: {
      name: true,
      phone: true,
      email: true,
      address: true,
      postalCode: true,
      city: true,
      country: true,
      description: true,
      imageUrls: true,
      websiteUrl: true,
      whatsappNumber: true,
      adminLocale: true,
      allowPhoneBooking: true,
      allowWhatsappBooking: true,
      allowYoyakuBooking: true,
      requiresDeposit: true,
      isPublished: true,
      slug: true,
      cancellationPolicy: true,
    },
  });

  return NextResponse.json(updated);
}
