mkdir -p "app/admin/store"
cat > "app/admin/store/page.tsx" << 'YOYAKU_EOF'
"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { MAX_STORE_IMAGES, MAX_STORE_IMAGE_BYTES } from "@/lib/storeImages";

type StoreInfo = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
  description: string | null;
  imageUrls: string[];
  websiteUrl: string | null;
  whatsappNumber: string | null;
  allowPhoneBooking: boolean;
  allowWhatsappBooking: boolean;
  allowYoyakuBooking: boolean;
  requiresDeposit: boolean;
  isPublished: boolean;
  slug: string;
};

type StripeConnectStatus = {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingCompletedAt: string | null;
};

const countryOptions: [string, string][] = [
  ["JP", "日本"],
  ["US", "アメリカ"],
  ["TH", "タイ"],
  ["KR", "韓国"],
  ["TW", "台湾"],
  ["CN", "中国"],
  ["VN", "ベトナム"],
  ["PH", "フィリピン"],
  ["GB", "イギリス"],
  ["AU", "オーストラリア"],
];

const fieldsBeforeAddress: [string, keyof StoreInfo][] = [
  ["店舗名", "name"],
  ["電話番号", "phone"],
  ["メールアドレス", "email"],
];

const fieldsAfterAddress: [string, keyof StoreInfo][] = [
  ["WhatsApp番号", "whatsappNumber"],
  ["WEBサイトアドレス", "websiteUrl"],
];

const bookingMethodFields: [string, keyof StoreInfo][] = [
  ["電話予約を受け付ける", "allowPhoneBooking"],
  ["WhatsApp予約を受け付ける", "allowWhatsappBooking"],
  ["Yoyaku上での予約を受け付ける", "allowYoyakuBooking"],
];

export default function StoreAdminPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  const [imageError, setImageError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(
    null
  );
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeError, setStripeError] = useState("");

  useEffect(() => {
    async function loadStore() {
      const response = await fetch("/api/store", {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage("店舗情報の読み込みに失敗しました。");
        setMessageIsError(true);
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as StoreInfo;

      setStore(data);
      setIsLoading(false);
    }

    loadStore();
  }, []);

  useEffect(() => {
    async function loadStripeStatus() {
      const response = await fetch("/api/admin/stripe-connect", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as StripeConnectStatus;

      setStripeStatus(data);
    }

    loadStripeStatus();
  }, []);

  async function connectStripe() {
    if (isConnectingStripe) {
      return;
    }

    setStripeError("");
    setIsConnectingStripe(true);

    const response = await fetch("/api/admin/stripe-connect", {
      method: "POST",
    });

    const data = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;

    if (!response.ok || !data?.url) {
      setStripeError(data?.error ?? "Stripe連携の開始に失敗しました。");
      setIsConnectingStripe(false);
      return;
    }

    window.location.href = data.url;
  }

  function updateTextField(key: keyof StoreInfo, value: string) {
    setStore((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current
    );
  }

  function updateBooleanField(key: keyof StoreInfo, value: boolean) {
    setStore((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current
    );
  }

  async function saveStore() {
    if (isSaving || !store) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSaving(true);

    const response = await fetch("/api/store", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(store),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      setMessage(errorBody?.error ?? "店舗情報の保存に失敗しました。");
      setMessageIsError(true);
      setIsSaving(false);
      return;
    }

    const data = (await response.json()) as StoreInfo;

    setStore(data);
    setMessage("店舗情報を保存しました。");
    setMessageIsError(false);
    setIsSaving(false);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !store) {
      return;
    }

    if (store.imageUrls.length >= MAX_STORE_IMAGES) {
      setImageError(`画像は最大${MAX_STORE_IMAGES}枚までです。`);
      return;
    }

    if (file.size > MAX_STORE_IMAGE_BYTES) {
      setImageError("画像サイズが大きすぎます(5MBまで)。");
      return;
    }

    setImageError("");
    setIsUploadingImage(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/store/images", {
      method: "POST",
      body: formData,
    });

    const data = (await response.json().catch(() => null)) as {
      imageUrls?: string[];
      error?: string;
    } | null;

    if (!response.ok || !data?.imageUrls) {
      setImageError(data?.error ?? "画像のアップロードに失敗しました。");
      setIsUploadingImage(false);
      return;
    }

    const uploadedImageUrls = data.imageUrls;

    setStore((current) =>
      current
        ? {
            ...current,
            imageUrls: uploadedImageUrls,
          }
        : current
    );
    setIsUploadingImage(false);
  }

  async function handleImageDelete(url: string) {
    setImageError("");

    const response = await fetch(
      `/api/admin/store/images?url=${encodeURIComponent(url)}`,
      {
        method: "DELETE",
      }
    );

    const data = (await response.json().catch(() => null)) as {
      imageUrls?: string[];
      error?: string;
    } | null;

    if (!response.ok || !data?.imageUrls) {
      setImageError(data?.error ?? "画像の削除に失敗しました。");
      return;
    }

    const remainingImageUrls = data.imageUrls;

    setStore((current) =>
      current
        ? {
            ...current,
            imageUrls: remainingImageUrls,
          }
        : current
    );
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold">店舗情報</h1>
        </Card>

        {isLoading || !store ? (
          <Card>
            <p className="text-center text-sm text-stone-500">読み込み中...</p>
          </Card>
        ) : (
          <>
            <Card className="space-y-3">
              <p className="font-bold">公開状態</p>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={store.isPublished}
                  onChange={(e) =>
                    updateBooleanField("isPublished", e.target.checked)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-green-800"
                />
                <span className="text-sm text-stone-700">
                  この店舗のページを一般公開する
                  <span className="mt-1 block text-xs text-stone-500">
                    公開URL: /s/{store.slug}
                  </span>
                </span>
              </label>
            </Card>

            <Card>
              <p className="mb-2 font-bold">
                店舗の写真(最大{MAX_STORE_IMAGES}枚)
              </p>

              <p className="mb-3 text-xs text-stone-500">
                店舗外観・受付・ベッド・施術風景など。1枚5MBまでのJPEG・PNG・WEBP・GIFに対応しています。
              </p>

              {store.imageUrls.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {store.imageUrls.map((url) => (
                    <div key={url} className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-28 w-28 rounded-2xl object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleImageDelete(url)}
                        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white"
                        aria-label="この画像を削除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {imageError ? (
                <p className="mt-2 text-sm font-bold text-red-700">
                  {imageError}
                </p>
              ) : null}

              {store.imageUrls.length < MAX_STORE_IMAGES ? (
                <label className="mt-3 block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />

                  <div className="w-full cursor-pointer rounded-2xl border border-dashed border-stone-300 py-3 text-center text-sm font-bold text-stone-600">
                    {isUploadingImage ? "アップロード中..." : "写真を追加"}
                  </div>
                </label>
              ) : null}
            </Card>

            {fieldsBeforeAddress.map(([label, key]) => (
              <Card key={key}>
                <p className="mb-2 font-bold">{label}</p>

                <input
                  className="w-full rounded-2xl border p-3"
                  value={(store[key] as string | null) ?? ""}
                  onChange={(e) => updateTextField(key, e.target.value)}
                />
              </Card>
            ))}

            <Card>
              <p className="mb-2 font-bold">国</p>

              <select
                className="w-full rounded-2xl border p-3"
                value={store.country}
                onChange={(e) => updateTextField("country", e.target.value)}
              >
                {!countryOptions.some(([code]) => code === store.country) ? (
                  <option value={store.country}>{store.country}</option>
                ) : null}

                {countryOptions.map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </Card>

            <Card>
              <p className="mb-2 font-bold">住所</p>

              <input
                className="w-full rounded-2xl border p-3"
                placeholder="郵便番号・市区町村・番地・建物名などをまとめてご入力ください"
                value={store.address ?? ""}
                onChange={(e) => updateTextField("address", e.target.value)}
              />
            </Card>

            {fieldsAfterAddress.map(([label, key]) => (
              <Card key={key}>
                <p className="mb-2 font-bold">{label}</p>

                <input
                  className="w-full rounded-2xl border p-3"
                  placeholder={
                    key === "websiteUrl" ? "例: https://example.com" : undefined
                  }
                  value={(store[key] as string | null) ?? ""}
                  onChange={(e) => updateTextField(key, e.target.value)}
                />
              </Card>
            ))}

            <Card>
              <p className="mb-2 font-bold">紹介文</p>

              <textarea
                rows={4}
                className="w-full rounded-2xl border p-3"
                value={store.description ?? ""}
                onChange={(e) =>
                  updateTextField("description", e.target.value)
                }
              />
            </Card>

            <Card className="space-y-3">
              <p className="font-bold">予約の受け方</p>

              {bookingMethodFields.map(([label, key]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    type="checkbox"
                    checked={store[key] as boolean}
                    onChange={(e) =>
                      updateBooleanField(key, e.target.checked)
                    }
                    className="mt-1 h-5 w-5 shrink-0 accent-green-800"
                  />
                  <span className="text-sm text-stone-700">{label}</span>
                </label>
              ))}

              <p className="text-xs text-stone-500">
                複数選択できます。お客様は空き時間を見た時点で、有効な方法から選べます。
              </p>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 font-bold">
                  <Icon name="check-circle" className="h-4 w-4 text-stone-400" />
                  決済の受け取り設定
                </p>

                {stripeStatus?.chargesEnabled ? (
                  <Badge variant="success">連携完了</Badge>
                ) : stripeStatus?.connected ? (
                  <Badge variant="warning">手続き中</Badge>
                ) : (
                  <Badge variant="neutral">未連携</Badge>
                )}
              </div>

              <p className="text-xs leading-5 text-stone-500">
                Stripeと連携すると、Yoyaku上での予約時にお客様から予約金(デポジット)をお支払いいただけるようになります。予約金は連携先の店舗様のStripeアカウントへ直接入金され、Yoyakuは手数料分のみを自動的にお預かりします。
              </p>

              {stripeError ? (
                <p className="text-sm font-bold text-red-700">{stripeError}</p>
              ) : null}

              <Button
                variant={stripeStatus?.chargesEnabled ? "secondary" : "primary"}
                onClick={connectStripe}
                disabled={isConnectingStripe}
              >
                {isConnectingStripe
                  ? "連携画面を準備しています..."
                  : stripeStatus?.connected
                    ? "Stripeでの設定を続ける"
                    : "Stripeで連携する"}
              </Button>
            </Card>

            <Card className="space-y-3">
              <p className="font-bold">オンライン予約金(デポジット)</p>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={store.requiresDeposit}
                  onChange={(e) =>
                    updateBooleanField("requiresDeposit", e.target.checked)
                  }
                  disabled={!stripeStatus?.chargesEnabled}
                  className="mt-1 h-5 w-5 shrink-0 accent-green-800 disabled:opacity-40"
                />
                <span className="text-sm text-stone-700">
                  Yoyaku上での予約時に予約金の支払いを必須にする
                  <span className="mt-1 block text-xs text-stone-500">
                    {stripeStatus?.chargesEnabled
                      ? "予約金の金額はメニューごとの設定に従います。"
                      : "先にStripe連携を完了してください。"}
                  </span>
                </span>
              </label>
            </Card>

            {message ? (
              <Card>
                <p
                  className={
                    messageIsError
                      ? "text-sm font-bold text-red-700"
                      : "text-sm font-bold text-green-800"
                  }
                >
                  {message}
                </p>
              </Card>
            ) : null}

            <Button onClick={saveStore} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </>
        )}
      </div>
    </AdminFrame>
  );
}
YOYAKU_EOF

mkdir -p "app/api/bookings/[id]/refund"
cat > "app/api/bookings/[id]/refund/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import {
  assertRefundableBooking,
  BookingLifecycleError,
} from "@/lib/bookingLifecycle";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type BookingRefundRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: BookingRefundRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: {
      id,
      storeId: store.id,
    },
  });

  if (!booking) {
    return NextResponse.json(
      {
        error: "予約が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  try {
    assertRefundableBooking({
      status: booking.status,
      bookingDate: booking.date,
      stripePaymentIntentId: booking.stripePaymentIntentId,
      refundedAt: booking.refundedAt,
    });

    const stripePaymentIntentId = booking.stripePaymentIntentId;

    if (!stripePaymentIntentId) {
      throw new BookingLifecycleError("返金対象の決済がありません。");
    }

    const refund = await getStripe().refunds.create(
      {
        payment_intent: stripePaymentIntentId,
        amount: booking.deposit,
        reason: "requested_by_customer",
        metadata: {
          bookingId: booking.id,
        },
      },
      booking.paymentStripeAccountId
        ? {
            stripeAccount: booking.paymentStripeAccountId,
          }
        : undefined
    );

    const updatedBooking = await prisma.booking.update({
      where: {
        id: booking.id,
        storeId: store.id,
      },
      data: {
        stripeRefundId: refund.id,
        refundedAt: new Date(),
        status: "CANCELLED",
        paymentAttempt: {
          update: {
            status: "REFUNDED",
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof BookingLifecycleError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "返金処理に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
YOYAKU_EOF

mkdir -p "app/api/public/stores/[slug]"
cat > "app/api/public/stores/[slug]/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";

import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;

  try {
    const store = await getPublicStoreBySlug(slug);

    return NextResponse.json({
      name: store.name,
      description: store.description,
      imageUrl: store.imageUrl,
      imageUrls: store.imageUrls,
      address: store.address,
      phone: store.phone,
      websiteUrl: store.websiteUrl,
      whatsappNumber: store.whatsappNumber,
      timezone: store.timezone,
      allowPhoneBooking: store.allowPhoneBooking,
      allowWhatsappBooking: store.allowWhatsappBooking,
      allowYoyakuBooking: store.allowYoyakuBooking,
      requiresDeposit: store.requiresDeposit,
      stripeAccountId: store.stripeAccountId,
      stripeChargesEnabled: store.stripeChargesEnabled,
    });
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    return NextResponse.json(
      {
        error: "店舗情報を取得できませんでした。",
      },
      {
        status: 500,
      }
    );
  }
}
YOYAKU_EOF

mkdir -p "app/api/store"
cat > "app/api/store/route.ts" << 'YOYAKU_EOF'
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
  country: "国",
  description: "紹介文",
  websiteUrl: "WEBサイトアドレス",
  whatsappNumber: "WhatsApp番号",
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
  allowPhoneBooking: z.boolean(),
  allowWhatsappBooking: z.boolean(),
  allowYoyakuBooking: z.boolean(),
  requiresDeposit: z.boolean(),
  isPublished: z.boolean(),
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
    allowPhoneBooking: store.allowPhoneBooking,
    allowWhatsappBooking: store.allowWhatsappBooking,
    allowYoyakuBooking: store.allowYoyakuBooking,
    requiresDeposit: store.requiresDeposit,
    isPublished: store.isPublished,
    slug: store.slug,
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
      country: true,
      description: true,
      imageUrls: true,
      websiteUrl: true,
      whatsappNumber: true,
      allowPhoneBooking: true,
      allowWhatsappBooking: true,
      allowYoyakuBooking: true,
      requiresDeposit: true,
      isPublished: true,
      slug: true,
    },
  });

  return NextResponse.json(updated);
}
YOYAKU_EOF

mkdir -p "app/api/stripe/webhook"
cat > "app/api/stripe/webhook/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  confirmPaidPaymentIntent,
  markPaymentIntentFailed,
} from "@/lib/paymentBookings";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { applyAccountStatusToStore } from "@/lib/stripeConnect";
import { getPaymentIntentStoreId } from "@/lib/stripePaymentMetadata";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "署名がありません。",
      },
      {
        status: 400,
      }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch {
    return NextResponse.json(
      {
        error: "Webhook署名を検証できません。",
      },
      {
        status: 400,
      }
    );
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const storeId = getPaymentIntentStoreId(paymentIntent.metadata);

      if (!storeId) {
        throw new Error("PaymentIntent storeId metadata missing");
      }

      await confirmPaidPaymentIntent(
        paymentIntent.id,
        storeId,
        paymentIntent.amount_received
      );
    }

    if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "payment_intent.canceled"
    ) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const storeId = getPaymentIntentStoreId(paymentIntent.metadata);

      if (!storeId) {
        throw new Error("PaymentIntent storeId metadata missing");
      }

      await markPaymentIntentFailed(paymentIntent.id, storeId);
    }

    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;

      await applyAccountStatusToStore(account);
    }
  } catch {
    return NextResponse.json(
      {
        error: "Webhook処理に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    received: true,
  });
}
YOYAKU_EOF

mkdir -p "app/s/[slug]/booking/customer"
cat > "app/s/[slug]/booking/customer/CustomerPageClient.tsx" << 'YOYAKU_EOF'
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Icon from "@/components/ui/Icon";

type StoreInfo = {
  requiresDeposit: boolean;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00.000Z`));
}

export default function CustomerPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const menuId = searchParams.get("menuId") || "";
  const date = searchParams.get("date") || getTodayDate();
  const duration = Number(searchParams.get("duration") || "60");
  const people = Number(searchParams.get("people") || "1");
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "担当者未指定";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [store, setStore] = useState<StoreInfo | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStore() {
      const response = await fetch(`/api/public/stores/${slug}`, {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | StoreInfo
        | null;

      if (isMounted && response.ok && data) {
        setStore(data);
      }
    }

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const methodUrl = useMemo(() => {
    const urlParams = new URLSearchParams({
      when,
      date,
      duration: String(duration),
      people: String(people),
      time,
      staff,
    });

    if (menuId) {
      urlParams.set("menuId", menuId);
    }

    return `/s/${slug}/booking/method?${urlParams.toString()}`;
  }, [slug, when, menuId, date, duration, people, time, staff]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();
    const normalizedNote = note.trim();

    if (!normalizedName) {
      setError("お名前を入力してください。");
      return;
    }

    if (!normalizedPhone) {
      setError("電話番号を入力してください。");
      return;
    }

    if (!/^[0-9+\-\s()]{8,20}$/.test(normalizedPhone)) {
      setError("電話番号を正しく入力してください。");
      return;
    }

    if (!normalizedEmail) {
      setError("メールアドレスを入力してください。");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("メールアドレスを正しく入力してください。");
      return;
    }

    if (!agreed) {
      setError("利用規約とキャンセルポリシーへの同意が必要です。");
      return;
    }

    if (store?.requiresDeposit) {
      const paymentParams = new URLSearchParams({
        when,
        date,
        duration: String(duration),
        people: String(people),
        time,
        staff,
        name: normalizedName,
        phone: normalizedPhone,
        email: normalizedEmail,
      });

      if (menuId) {
        paymentParams.set("menuId", menuId);
      }

      if (normalizedNote) {
        paymentParams.set("note", normalizedNote);
      }

      router.push(`/s/${slug}/booking/payment?${paymentParams.toString()}`);
      return;
    }

    setIsSubmitting(true);

    const bookingDate = new Date(`${date}T${time}:00.000Z`);

    try {
      const response = await fetch(`/api/public/stores/${slug}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menuId: menuId || undefined,
          customer: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone,
          memo: normalizedNote,
          date: bookingDate.toISOString(),
          duration,
          people,
          staff,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { bookingNo?: string; error?: string }
        | null;

      if (!response.ok || !data?.bookingNo) {
        setError(data?.error ?? "予約に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      router.push(
        `/s/${slug}/booking/complete?bookingNo=${encodeURIComponent(
          data.bookingNo
        )}`
      );
    } catch {
      setError("予約に失敗しました。");
      setIsSubmitting(false);
    }
  }

  return (
    <MobileFrame>
      <main className="min-h-screen bg-stone-100 pb-32">
        <div className="mx-auto w-full max-w-[430px] px-4 py-5">
          <Link
            href={methodUrl}
            className="inline-flex items-center gap-1 text-sm font-bold text-green-800"
          >
            <span aria-hidden="true">←</span>
            予約内容に戻る
          </Link>

          <header className="mt-6">
            <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900">
              予約者情報
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              予約確認のため、連絡先を入力してください。
            </p>
          </header>

          <Card className="mt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2.5">
                <Icon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <div>
                  <p className="text-xs font-bold text-stone-500">予約日時</p>

                  <p className="mt-1 text-base font-black text-stone-900">
                    {formatDate(date)} {time}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">{when}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-stone-200 pt-4">
                <div className="flex items-start gap-1.5">
                  <Icon name="clock" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500">施術時間</p>
                    <p className="mt-1 font-bold text-stone-900">{duration}分</p>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <Icon name="users" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500">人数</p>
                    <p className="mt-1 font-bold text-stone-900">{people}人</p>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <Icon name="user" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500">担当</p>
                    <p className="mt-1 truncate font-bold text-stone-900">
                      {staff}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} noValidate>
            <Card className="mt-4">
              <div className="space-y-5">
                <Input
                  id="customer-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="山田 太郎"
                  label="お名前 *"
                />

                <Input
                  id="customer-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="090-1234-5678"
                  label="電話番号 *"
                />

                <Input
                  id="customer-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="example@email.com"
                  label="メールアドレス *"
                  hint="予約確認メールをこのアドレスへ送信します。"
                />

                <div>
                  <label
                    htmlFor="customer-note"
                    className="block text-sm font-bold text-stone-800"
                  >
                    ご要望・メモ
                    <span className="ml-2 text-xs font-normal text-stone-500">
                      任意
                    </span>
                  </label>

                  <textarea
                    id="customer-note"
                    name="note"
                    rows={4}
                    maxLength={500}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="施術に関するご要望などがあれば入力してください。"
                    className="mt-2 w-full resize-none rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                  />

                  <p className="mt-1 text-right text-xs text-stone-400">
                    {note.length}/500
                  </p>
                </div>
              </div>
            </Card>

            <Card className="mt-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-green-800"
                />

                <span className="text-sm leading-6 text-stone-700">
                  利用規約、プライバシーポリシーおよび
                  キャンセルポリシーに同意します。
                </span>
              </label>
            </Card>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {error}
              </div>
            ) : null}

            <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-stone-200 bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
              <Button type="submit" size="lg" isLoading={isSubmitting}>
                {isSubmitting
                  ? "予約しています..."
                  : store?.requiresDeposit
                    ? "予約金の支払いへ進む"
                    : "予約を確定する"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </MobileFrame>
  );
}
YOYAKU_EOF

mkdir -p "app/s/[slug]/booking/method"
cat > "app/s/[slug]/booking/method/MethodPageClient.tsx" << 'YOYAKU_EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";

type StoreInfo = {
  name: string;
  phone: string | null;
  whatsappNumber: string | null;
  allowPhoneBooking: boolean;
  allowWhatsappBooking: boolean;
  allowYoyakuBooking: boolean;
  requiresDeposit: boolean;
  stripeChargesEnabled: boolean;
};

type ServiceMenu = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  deposit: number;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00.000Z`));
}

function toWhatsappLink(number: string) {
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}`;
}

export default function MethodPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const menuId = searchParams.get("menuId") || "";
  const date = searchParams.get("date") || getTodayDate();
  const duration = Number(searchParams.get("duration") || 60);
  const people = Number(searchParams.get("people") || 1);
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "担当者未指定";

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [menu, setMenu] = useState<ServiceMenu | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [storeResponse, menusResponse] = await Promise.all([
        fetch(`/api/public/stores/${slug}`, { cache: "no-store" }),
        fetch(`/api/public/stores/${slug}/service-menus`, {
          cache: "no-store",
        }),
      ]);

      if (!isMounted) {
        return;
      }

      if (!storeResponse.ok) {
        setError("店舗情報を取得できませんでした。");
        return;
      }

      const storeData = (await storeResponse.json()) as StoreInfo;
      setStore(storeData);

      const menusData = (await menusResponse
        .json()
        .catch(() => [])) as ServiceMenu[];
      const matchedMenu =
        menusData.find((item) => item.id === menuId) ??
        menusData.find((item) => item.durationMinutes === duration) ??
        null;
      setMenu(matchedMenu);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, menuId, duration]);

  const availabilityParams = new URLSearchParams({
    when,
    date,
    duration: String(duration),
    people: String(people),
  });

  const customerParams = new URLSearchParams({
    when,
    date,
    duration: String(duration),
    people: String(people),
    time,
    staff,
  });

  if (menuId) {
    availabilityParams.set("menuId", menuId);
    customerParams.set("menuId", menuId);
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <Link
          href={`/s/${slug}/booking/availability?${availabilityParams.toString()}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-stone-500"
        >
          <Icon name="chevron-left" className="h-3.5 w-3.5" />
          空き時間に戻る
        </Link>

        <Card className="space-y-4">
          {store ? (
            <p className="text-sm font-bold text-green-800">{store.name}</p>
          ) : (
            <Skeleton className="h-4 w-32" />
          )}

          <h1 className="text-3xl font-bold text-stone-900">予約内容の確認</h1>

          <div className="space-y-3 border-t border-stone-200 pt-4">
            <div className="flex items-start gap-2.5">
              <Icon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">予約日</p>
                <p className="text-xl font-bold text-stone-900">
                  {formatDate(date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">予約タイミング</p>
                <p className="text-xl font-bold text-stone-900">{when}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">開始時間</p>
                <p className="text-xl font-bold text-stone-900">{time}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">施術時間</p>
                <p className="text-xl font-bold text-stone-900">{duration}分</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Icon name="users" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">人数</p>
                <p className="text-xl font-bold text-stone-900">{people}人</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Icon name="user" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
              <div>
                <p className="text-sm text-stone-500">担当</p>
                <p className="text-xl font-bold text-stone-900">{staff}</p>
              </div>
            </div>
          </div>
        </Card>

        {menu ? (
          <Card className="space-y-3">
            <h2 className="flex items-center gap-1.5 text-xl font-bold text-stone-900">
              <Icon name="star" className="h-4 w-4 text-stone-400" />
              料金
            </h2>

            <div className="flex justify-between text-stone-700">
              <span>施術料金</span>
              <span>¥{menu.price.toLocaleString()}</span>
            </div>

            {store?.requiresDeposit ? (
              <div className="flex justify-between text-stone-700">
                <span>予約金</span>
                <span>¥{menu.deposit.toLocaleString()}</span>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                この店舗はオンライン決済不要です。当日、店舗にてお支払いください。
              </p>
            )}
          </Card>
        ) : null}

        {error ? (
          <Card>
            <p className="font-bold text-red-700">{error}</p>
          </Card>
        ) : null}

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">
            予約方法を選んでください
          </h2>

          {store?.allowPhoneBooking && store.phone ? (
            <a
              href={`tel:${store.phone}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-stone-800 px-4 py-3.5 text-center text-sm font-bold text-white transition active:scale-[0.98]"
            >
              <Icon name="phone" className="h-4 w-4" />
              電話する（{store.phone}）
            </a>
          ) : null}

          {store?.allowWhatsappBooking && store.whatsappNumber ? (
            <a
              href={toWhatsappLink(store.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3.5 text-center text-sm font-bold text-white transition active:scale-[0.98]"
            >
              <Icon name="message" className="h-4 w-4" />
              WhatsAppで連絡する
            </a>
          ) : null}

          {store?.allowYoyakuBooking ? (
            store.requiresDeposit ? (
              store.stripeChargesEnabled ? (
                <Link href={`/s/${slug}/booking/customer?${customerParams.toString()}`}>
                  <Button size="lg">予約金を支払って予約する</Button>
                </Link>
              ) : (
                <p className="flex items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3.5 text-center text-sm font-bold text-stone-500">
                  <Icon name="info" className="h-4 w-4 shrink-0" />
                  この店舗のオンライン予約は準備中です。電話またはWhatsAppでご連絡ください。
                </p>
              )
            ) : (
              <Link href={`/s/${slug}/booking/customer?${customerParams.toString()}`}>
                <Button size="lg">このまま予約する</Button>
              </Link>
            )
          ) : null}
        </Card>
      </div>
    </MobileFrame>
  );
}
YOYAKU_EOF

mkdir -p "lib"
cat > "lib/paymentBookings.ts" << 'YOYAKU_EOF'
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  acquireBookingLocks,
  buildBookingNo,
  checkRequestedBookingAvailability,
  isTransactionConflict,
} from "@/lib/serverBookingAvailability";

const MAX_TRANSACTION_RETRIES = 3;

class PaymentBookingConflictError extends Error {
  constructor(message = "指定された日時は予約できません。") {
    super(message);
    this.name = "PaymentBookingConflictError";
  }
}

export function isPaymentBookingConflictError(error: unknown) {
  return error instanceof PaymentBookingConflictError;
}

export function assertPaymentStoreIdMatches(
  paymentAttemptStoreId: string,
  expectedStoreId: string
) {
  if (paymentAttemptStoreId !== expectedStoreId) {
    throw new PaymentBookingConflictError("決済情報の店舗が一致しません。");
  }
}

export async function confirmPaidPaymentIntent(
  paymentIntentId: string,
  expectedStoreId: string,
  paidAmount?: number
) {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existingBooking = await tx.booking.findUnique({
            where: {
              stripePaymentIntentId: paymentIntentId,
            },
          });

          if (existingBooking) {
            if (existingBooking.storeId !== expectedStoreId) {
              throw new PaymentBookingConflictError(
                "決済情報の店舗が一致しません。"
              );
            }

            return existingBooking;
          }

          const paymentAttempt = await tx.bookingPaymentAttempt.findUnique({
            where: {
              stripePaymentIntentId: paymentIntentId,
            },
          });

          if (!paymentAttempt) {
            throw new PaymentBookingConflictError("決済情報が見つかりません。");
          }

          assertPaymentStoreIdMatches(paymentAttempt.storeId, expectedStoreId);

          if (
            paidAmount !== undefined &&
            paymentAttempt.deposit !== paidAmount
          ) {
            await tx.bookingPaymentAttempt.update({
              where: {
                id: paymentAttempt.id,
              },
              data: {
                status: "FAILED",
              },
            });

            throw new PaymentBookingConflictError(
              "決済金額が予約金と一致しません。"
            );
          }

          const dateValue = paymentAttempt.date.toISOString().slice(0, 10);
          const startTime = `${String(paymentAttempt.date.getUTCHours()).padStart(
            2,
            "0"
          )}:${String(paymentAttempt.date.getUTCMinutes()).padStart(2, "0")}`;
          const staffNames = paymentAttempt.staff
            .split("+")
            .map((name) => name.trim())
            .filter(Boolean);

          await acquireBookingLocks(tx, paymentAttempt.storeId, dateValue, staffNames);

          const availability = await checkRequestedBookingAvailability(tx, {
            storeId: paymentAttempt.storeId,
            dateValue,
            startTime,
            duration: paymentAttempt.duration,
            people: paymentAttempt.people,
            staffNames,
            ignorePaymentIntentId: paymentIntentId,
          });

          if (!availability.ok) {
            await tx.bookingPaymentAttempt.update({
              where: {
                id: paymentAttempt.id,
              },
              data: {
                status: "FAILED",
              },
            });

            throw new PaymentBookingConflictError(availability.reason);
          }

          const booking = await tx.booking.create({
            data: {
              storeId: paymentAttempt.storeId,
              serviceMenuId: paymentAttempt.serviceMenuId,
              bookingNo: buildBookingNo(),
              customer: paymentAttempt.customer,
              email: paymentAttempt.email,
              phone: paymentAttempt.phone,
              memo: paymentAttempt.memo,
              date: paymentAttempt.date,
              duration: paymentAttempt.duration,
              people: paymentAttempt.people,
              staff: paymentAttempt.staff,
              menu: paymentAttempt.menu,
              amount: paymentAttempt.amount,
              deposit: paymentAttempt.deposit,
              status: "CONFIRMED",
              stripePaymentIntentId: paymentIntentId,
              platformFeeAmount: paymentAttempt.platformFeeAmount,
              paymentStripeAccountId: paymentAttempt.paymentStripeAccountId,
            },
          });

          await tx.bookingPaymentAttempt.update({
            where: {
              id: paymentAttempt.id,
            },
            data: {
              status: "SUCCEEDED",
              bookingId: booking.id,
            },
          });

          return booking;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000,
          timeout: 10000,
        }
      );
    } catch (error) {
      if (isPaymentBookingConflictError(error)) {
        throw error;
      }

      if (
        (isTransactionConflict(error) ||
          (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002")) &&
        attempt < MAX_TRANSACTION_RETRIES
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new PaymentBookingConflictError(
    "予約処理が混み合っています。もう一度お試しください。"
  );
}

export async function markPaymentIntentFailed(
  paymentIntentId: string,
  expectedStoreId: string
) {
  const paymentAttempt = await prisma.bookingPaymentAttempt.findUnique({
    where: {
      stripePaymentIntentId: paymentIntentId,
    },
    select: {
      storeId: true,
    },
  });

  if (!paymentAttempt) {
    return;
  }

  assertPaymentStoreIdMatches(paymentAttempt.storeId, expectedStoreId);

  await prisma.bookingPaymentAttempt.updateMany({
    where: {
      stripePaymentIntentId: paymentIntentId,
      storeId: expectedStoreId,
      bookingId: null,
    },
    data: {
      status: "FAILED",
    },
  });
}
YOYAKU_EOF

cat > "lib/platformFee.ts" << 'YOYAKU_EOF'
const DEFAULT_PLATFORM_FEE_BPS = 500;

export function getPlatformFeeBps() {
  const raw = process.env.PLATFORM_FEE_BPS;
  const parsed = raw ? Number(raw) : NaN;

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10000) {
    return DEFAULT_PLATFORM_FEE_BPS;
  }

  return parsed;
}

export function calculatePlatformFee(depositAmount: number) {
  return Math.round((depositAmount * getPlatformFeeBps()) / 10000);
}
YOYAKU_EOF

cat > "lib/stripeConnect.ts" << 'YOYAKU_EOF'
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function createConnectedAccount(store: {
  id: string;
  name: string;
  email: string | null;
  country: string;
}) {
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: "standard",
    country: store.country || "JP",
    email: store.email ?? undefined,
    business_profile: {
      name: store.name,
    },
  });

  await prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      stripeAccountId: account.id,
    },
  });

  return account;
}

export async function createOnboardingLink(
  accountId: string,
  urls: { refreshUrl: string; returnUrl: string }
) {
  const stripe = getStripe();

  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: urls.refreshUrl,
    return_url: urls.returnUrl,
    type: "account_onboarding",
  });
}

export async function applyAccountStatusToStore(account: Stripe.Account) {
  const store = await prisma.store.findUnique({
    where: {
      stripeAccountId: account.id,
    },
    select: {
      id: true,
      stripeOnboardingCompletedAt: true,
    },
  });

  if (!store) {
    return null;
  }

  return prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      stripeChargesEnabled: Boolean(account.charges_enabled),
      stripePayoutsEnabled: Boolean(account.payouts_enabled),
      stripeDetailsSubmitted: Boolean(account.details_submitted),
      stripeOnboardingCompletedAt:
        account.details_submitted && !store.stripeOnboardingCompletedAt
          ? new Date()
          : store.stripeOnboardingCompletedAt,
    },
  });
}

export async function syncAccountStatus(accountId: string) {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  return applyAccountStatusToStore(account);
}
YOYAKU_EOF

mkdir -p "app/api/admin/stripe-connect/refresh"
cat > "app/api/admin/stripe-connect/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { createConnectedAccount, createOnboardingLink } from "@/lib/stripeConnect";

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";
}

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  return NextResponse.json({
    connected: Boolean(store.stripeAccountId),
    chargesEnabled: store.stripeChargesEnabled,
    payoutsEnabled: store.stripePayoutsEnabled,
    detailsSubmitted: store.stripeDetailsSubmitted,
    onboardingCompletedAt: store.stripeOnboardingCompletedAt,
  });
}

export async function POST() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  try {
    const accountId =
      store.stripeAccountId ??
      (
        await createConnectedAccount({
          id: store.id,
          name: store.name,
          email: store.email,
          country: store.country,
        })
      ).id;

    const accountLink = await createOnboardingLink(accountId, {
      refreshUrl: `${baseUrl()}/admin/store`,
      returnUrl: `${baseUrl()}/api/admin/stripe-connect/refresh`,
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Stripe連携の開始に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
YOYAKU_EOF

cat > "app/api/admin/stripe-connect/refresh/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { syncAccountStatus } from "@/lib/stripeConnect";

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";
}

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return NextResponse.redirect(`${baseUrl()}/login`);
  }

  if (store.stripeAccountId) {
    await syncAccountStatus(store.stripeAccountId).catch(() => null);
  }

  return NextResponse.redirect(`${baseUrl()}/admin/store`);
}
YOYAKU_EOF

mkdir -p "app/api/public/stores/[slug]/payment-intents/[id]/booking"
cat > "app/api/public/stores/[slug]/payment-intents/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import {
  createBookingRequestSchema,
  normalizeBookingRequest,
} from "@/lib/bookingRequest";
import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import { calculatePlatformFee } from "@/lib/platformFee";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { buildBookingPaymentIntentMetadata } from "@/lib/stripePaymentMetadata";
import {
  getServiceMenuBookingPrice,
  getServiceMenuForBooking,
  ServiceMenuError,
} from "@/lib/serviceMenus";
import {
  acquireBookingLocks,
  checkRequestedBookingAvailability,
  isTransactionConflict,
} from "@/lib/serverBookingAvailability";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

class PaymentIntentConflictError extends Error {
  constructor(message = "指定された日時は予約できません。") {
    super(message);
    this.name = "PaymentIntentConflictError";
  }
}

function jsonError(message: string, status: 400 | 404 | 409 | 500) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return jsonError("リクエスト内容が正しくありません。", 400);
  }

  const parsed = createBookingRequestSchema.safeParse(json);

  if (!parsed.success) {
    return jsonError("予約内容の入力が正しくありません。", 400);
  }

  const normalized = normalizeBookingRequest(parsed.data);

  if (!normalized) {
    return jsonError("予約日時または担当者が正しくありません。", 400);
  }

  try {
    const store = await getPublicStoreBySlug(slug);

    if (!store.allowYoyakuBooking || !store.requiresDeposit) {
      return jsonError("この店舗は予約金決済を利用していません。", 400);
    }

    if (!store.stripeAccountId || !store.stripeChargesEnabled) {
      return jsonError(
        "この店舗はオンライン決済の準備が完了していません。電話またはWhatsAppでご連絡ください。",
        400
      );
    }

    const stripeAccountId = store.stripeAccountId;

    const menu = await getServiceMenuForBooking(prisma, {
      storeId: store.id,
      menuId: parsed.data.menuId,
      duration: parsed.data.duration,
    });
    const menuPrice = getServiceMenuBookingPrice(menu);
    const platformFeeAmount = calculatePlatformFee(menuPrice.deposit);

    const result = await prisma.$transaction(
      async (tx) => {
        await acquireBookingLocks(
          tx,
          store.id,
          normalized.bookingDate.dateValue,
          normalized.staffNames
        );

        const availability = await checkRequestedBookingAvailability(tx, {
          storeId: store.id,
          dateValue: normalized.bookingDate.dateValue,
          startTime: normalized.bookingDate.timeValue,
          duration: menu.durationMinutes,
          people: parsed.data.people,
          staffNames: normalized.staffNames,
        });

        if (!availability.ok) {
          throw new PaymentIntentConflictError(availability.reason);
        }

        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create(
          {
            amount: menuPrice.deposit,
            currency: menu.currency.toLowerCase(),
            automatic_payment_methods: {
              enabled: true,
            },
            application_fee_amount: platformFeeAmount,
            metadata: buildBookingPaymentIntentMetadata({
              storeId: store.id,
              serviceMenuId: menu.id,
              bookingDate: normalized.bookingDate.dateValue,
              bookingTime: normalized.bookingDate.timeValue,
              duration: menu.durationMinutes,
              people: parsed.data.people,
            }),
          },
          {
            stripeAccount: stripeAccountId,
          }
        );

        if (!paymentIntent.client_secret) {
          throw new Error("PaymentIntent client secret missing");
        }

        await tx.bookingPaymentAttempt.create({
          data: {
            storeId: store.id,
            serviceMenuId: menu.id,
            stripePaymentIntentId: paymentIntent.id,
            customer: parsed.data.customer,
            email: parsed.data.email,
            phone: parsed.data.phone,
            memo: parsed.data.memo,
            date: normalized.bookingDate.bookingDate,
            duration: menu.durationMinutes,
            people: parsed.data.people,
            staff: normalized.staffLabel,
            menu: menu.name,
            amount: menuPrice.totalPrice,
            deposit: menuPrice.deposit,
            status: "CREATED",
            platformFeeAmount,
            paymentStripeAccountId: stripeAccountId,
          },
        });

        return {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: menuPrice.totalPrice,
          deposit: menuPrice.deposit,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return jsonError(error.message, error.status === 404 ? 404 : 500);
    }

    if (error instanceof PaymentIntentConflictError) {
      return jsonError(error.message, 409);
    }

    if (error instanceof ServiceMenuError) {
      return jsonError(error.message, 400);
    }

    if (isTransactionConflict(error)) {
      return jsonError(
        "予約処理が混み合っています。もう一度お試しください。",
        409
      );
    }

    return jsonError("決済の準備に失敗しました。", 500);
  }
}
YOYAKU_EOF

cat > "app/api/public/stores/[slug]/payment-intents/[id]/booking/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";

import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import {
  confirmPaidPaymentIntent,
  isPaymentBookingConflictError,
} from "@/lib/paymentBookings";
import { getStripe } from "@/lib/stripe";
import { getPaymentIntentStoreId } from "@/lib/stripePaymentMetadata";

type PaymentIntentBookingRouteContext = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

function jsonError(message: string, status: 404 | 409 | 500) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

export async function GET(
  _request: Request,
  context: PaymentIntentBookingRouteContext
) {
  const { slug, id } = await context.params;

  try {
    const store = await getPublicStoreBySlug(slug);

    if (!store.stripeAccountId) {
      return jsonError("この店舗の決済設定が見つかりません。", 409);
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(
      id,
      {},
      {
        stripeAccount: store.stripeAccountId,
      }
    );

    if (paymentIntent.status !== "succeeded") {
      return jsonError("決済が完了していません。", 409);
    }

    const storeId = getPaymentIntentStoreId(paymentIntent.metadata);

    if (!storeId || storeId !== store.id) {
      return jsonError("決済情報の店舗を確認できません。", 409);
    }

    const booking = await confirmPaidPaymentIntent(
      paymentIntent.id,
      storeId,
      paymentIntent.amount_received
    );

    return NextResponse.json(booking);
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return jsonError(error.message, error.status === 404 ? 404 : 500);
    }

    if (isPaymentBookingConflictError(error)) {
      return jsonError(
        error instanceof Error ? error.message : "予約を確定できませんでした。",
        409
      );
    }

    return jsonError("予約確認に失敗しました。", 500);
  }
}
YOYAKU_EOF

mkdir -p "app/s/[slug]/booking/payment"
cat > "app/s/[slug]/booking/payment/PaymentPageClient.tsx" << 'YOYAKU_EOF'
"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  loadStripe,
  type Stripe,
  type StripeCardElement,
  type StripeElements,
} from "@stripe/stripe-js";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";

type StoreInfo = {
  name: string;
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean;
};

type ServiceMenu = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  deposit: number;
};

type PaymentIntentResponse = {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  deposit: number;
};

type BookingResponse = {
  id: string;
  bookingNo: string;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00.000Z`));
}

export default function PaymentPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const menuId = searchParams.get("menuId") || "";
  const date = searchParams.get("date") || getTodayDate();
  const duration = Number(searchParams.get("duration") || 60);
  const people = Number(searchParams.get("people") || 1);
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "担当者未指定";
  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const note = searchParams.get("note") || "";

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [menu, setMenu] = useState<ServiceMenu | null>(null);

  const cardElementRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const cardRef = useRef<StripeCardElement | null>(null);

  const [cardholderName, setCardholderName] = useState(name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const customerUrl = useMemo(() => {
    const urlParams = new URLSearchParams({
      when,
      date,
      duration: String(duration),
      people: String(people),
      time,
      staff,
    });

    if (menuId) {
      urlParams.set("menuId", menuId);
    }

    return `/s/${slug}/booking/customer?${urlParams.toString()}`;
  }, [slug, when, date, duration, people, time, staff, menuId]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [storeResponse, menusResponse] = await Promise.all([
        fetch(`/api/public/stores/${slug}`, { cache: "no-store" }),
        fetch(`/api/public/stores/${slug}/service-menus`, {
          cache: "no-store",
        }),
      ]);

      if (!isMounted) {
        return;
      }

      if (storeResponse.ok) {
        const storeData = (await storeResponse.json()) as StoreInfo;
        setStore(storeData);
      }

      const menusData = (await menusResponse
        .json()
        .catch(() => [])) as ServiceMenu[];
      const matchedMenu =
        menusData.find((item) => item.id === menuId) ??
        menusData.find((item) => item.durationMinutes === duration) ??
        null;
      setMenu(matchedMenu);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, menuId, duration]);

  useEffect(() => {
    let isMounted = true;

    async function mountStripeElement() {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      if (!store?.stripeAccountId || !publishableKey) {
        return;
      }

      const stripe = await loadStripe(publishableKey, {
        stripeAccount: store.stripeAccountId,
      });

      if (!isMounted) {
        return;
      }

      if (!stripe || !cardElementRef.current) {
        setError("Stripe決済の準備に失敗しました。");
        return;
      }

      const elements = stripe.elements();
      const card = elements.create("card", {
        hidePostalCode: true,
        style: {
          base: {
            color: "#1c1917",
            fontSize: "16px",
            "::placeholder": {
              color: "#a8a29e",
            },
          },
          invalid: {
            color: "#b91c1c",
          },
        },
      });

      card.mount(cardElementRef.current);

      stripeRef.current = stripe;
      elementsRef.current = elements;
      cardRef.current = card;
    }

    mountStripeElement();

    return () => {
      isMounted = false;
      cardRef.current?.destroy();
      cardRef.current = null;
      elementsRef.current = null;
      stripeRef.current = null;
    };
  }, [store?.stripeAccountId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    if (!cardholderName.trim()) {
      setError("カード名義人を入力してください。");
      return;
    }

    if (!name || !phone || !email) {
      setError("予約者情報が不足しています。前の画面へ戻ってください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const stripe = stripeRef.current;
      const card = cardRef.current;

      if (!stripe || !card) {
        setError("決済フォームを読み込めませんでした。");
        setIsSubmitting(false);
        return;
      }

      const bookingDate = new Date(`${date}T${time}:00.000Z`);

      if (Number.isNaN(bookingDate.getTime())) {
        setError("予約日時が正しくありません。");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        `/api/public/stores/${slug}/payment-intents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            menuId: menuId || undefined,
            customer: name,
            email,
            phone,
            memo: note,
            date: bookingDate.toISOString(),
            duration,
            people,
            staff,
          }),
        }
      );

      const data = (await response.json().catch(() => null)) as
        | PaymentIntentResponse
        | { error?: string }
        | null;

      if (!response.ok || !data || !("clientSecret" in data)) {
        setError(
          data && "error" in data && data.error
            ? data.error
            : "決済の準備に失敗しました。"
        );
        setIsSubmitting(false);
        return;
      }

      const paymentResult = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card,
            billing_details: {
              name: cardholderName.trim(),
              email,
              phone,
            },
          },
        }
      );

      if (paymentResult.error) {
        setError(paymentResult.error.message || "決済に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      if (paymentResult.paymentIntent?.status !== "succeeded") {
        setError("決済が完了していません。");
        setIsSubmitting(false);
        return;
      }

      const bookingResponse = await fetch(
        `/api/public/stores/${slug}/payment-intents/${data.paymentIntentId}/booking`,
        {
          cache: "no-store",
        }
      );

      const booking = (await bookingResponse.json().catch(() => null)) as
        | BookingResponse
        | { error?: string }
        | null;

      if (!bookingResponse.ok || !booking || !("bookingNo" in booking)) {
        setError(
          booking && "error" in booking && booking.error
            ? booking.error
            : "予約の確定に失敗しました。"
        );
        setIsSubmitting(false);
        return;
      }

      router.push(
        `/s/${slug}/booking/complete?bookingNo=${encodeURIComponent(
          booking.bookingNo
        )}`
      );
    } catch {
      setError("予約処理中にエラーが発生しました。");
      setIsSubmitting(false);
    }
  }

  const totalPrice = menu?.price ?? 0;
  const deposit = menu?.deposit ?? 0;
  const remainingPrice = totalPrice - deposit;

  return (
    <MobileFrame>
      <main className="min-h-screen bg-stone-100 pb-36">
        <div className="mx-auto w-full max-w-[430px] px-4 py-5">
          <Link
            href={customerUrl}
            className="inline-flex items-center gap-1 text-sm font-bold text-green-800"
          >
            <span aria-hidden="true">←</span>
            予約者情報に戻る
          </Link>

          <header className="mt-6">
            {store ? (
              <p className="text-sm font-bold text-green-800">{store.name}</p>
            ) : (
              <Skeleton className="h-4 w-32" />
            )}

            <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900">
              予約金のお支払い
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              予約確定のため、予約金をお支払いください。
            </p>
          </header>

          <Card className="mt-6">
            <h2 className="text-lg font-black text-stone-900">
              お支払い内容
            </h2>

            <dl className="mt-4 divide-y divide-stone-200">
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-1.5 text-sm text-stone-500">
                  <Icon name="calendar" className="h-4 w-4 text-stone-400" />
                  予約日時
                </dt>

                <dd className="text-right text-sm font-bold text-stone-900">
                  {formatDate(date)}
                  <br />
                  {time}
                </dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-1.5 text-sm text-stone-500">
                  <Icon name="clock" className="h-4 w-4 text-stone-400" />
                  予約内容
                </dt>

                <dd className="text-right text-sm font-bold text-stone-900">
                  {duration}分・{people}人
                </dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-1.5 text-sm text-stone-500">
                  <Icon name="user" className="h-4 w-4 text-stone-400" />
                  担当
                </dt>

                <dd className="max-w-[60%] text-right text-sm font-bold text-stone-900">
                  {staff}
                </dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-stone-500">施術料金</dt>

                <dd className="text-right text-sm font-bold text-stone-900">
                  ¥{totalPrice.toLocaleString()}
                </dd>
              </div>

              <div className="flex items-end justify-between py-4">
                <dt>
                  <p className="text-sm font-bold text-stone-900">
                    本日のお支払い(予約金)
                  </p>
                </dt>

                <dd className="text-2xl font-black text-green-800">
                  ¥{deposit.toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="rounded-xl bg-stone-100 px-4 py-3">
              <p className="text-xs leading-5 text-stone-600">
                残額 ¥{remainingPrice.toLocaleString()}
                は、ご来店当日に店舗でお支払いください。
              </p>
            </div>
          </Card>

          <form onSubmit={handleSubmit} noValidate>
            <Card className="mt-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-stone-900">
                  カード情報
                </h2>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-800">
                  安全な決済
                </span>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor="cardholder-name"
                    className="block text-sm font-bold text-stone-800"
                  >
                    カード名義人
                  </label>

                  <input
                    id="cardholder-name"
                    type="text"
                    autoComplete="cc-name"
                    value={cardholderName}
                    onChange={(event) =>
                      setCardholderName(event.target.value.toUpperCase())
                    }
                    placeholder="TARO YAMADA"
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base uppercase text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stripe-card-element"
                    className="block text-sm font-bold text-stone-800"
                  >
                    カード情報
                  </label>

                  <div
                    id="stripe-card-element"
                    ref={cardElementRef}
                    className="mt-2 rounded-xl border border-stone-300 bg-white px-4 py-4 text-base text-stone-900 outline-none transition focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/10"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-stone-100 px-4 py-3">
                <p className="text-xs leading-5 text-stone-600">
                  カード情報はStripeで安全に処理され、Yoyakuには保存されません。
                </p>
              </div>
            </Card>

            <Card className="mt-4">
              <h2 className="text-lg font-black text-stone-900">
                キャンセルについて
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                予約時間の24時間前までのキャンセルは、
                予約金を返金します。24時間以内のキャンセルは、
                予約金を返金できません。
              </p>
            </Card>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {error}
              </div>
            ) : null}

            <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-stone-200 bg-white/95 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-green-800 bg-green-800 px-4 py-4 text-base font-black text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "予約処理中..."
                  : `¥${deposit.toLocaleString()}を支払って予約確定`}
              </button>

              <p className="mt-2 text-center text-[11px] text-stone-500">
                決済成功後に予約が確定します。
              </p>
            </div>
          </form>
        </div>
      </main>
    </MobileFrame>
  );
}
YOYAKU_EOF

cat > "app/s/[slug]/booking/payment/page.tsx" << 'YOYAKU_EOF'
import { Suspense } from "react";

import MobileFrame from "@/components/layout/MobileFrame";
import PaymentPageClient from "./PaymentPageClient";

export default function StorePaymentPage() {
  return (
    <Suspense
      fallback={
        <MobileFrame>
          <div className="p-6 text-center text-stone-500">読み込み中...</div>
        </MobileFrame>
      }
    >
      <PaymentPageClient />
    </Suspense>
  );
}
YOYAKU_EOF
