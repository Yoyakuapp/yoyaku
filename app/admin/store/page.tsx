"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { MAX_STORE_IMAGES, MAX_STORE_IMAGE_BYTES } from "@/lib/storeImages";
import type { Locale } from "@/lib/i18n/locales";

type CancellationPolicyTier = {
  hoursBefore: number;
  refundPercent: number;
};

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
  cancellationPolicy: CancellationPolicyTier[] | null;
  adminLocale: Locale;
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

  function addCancellationTier() {
    setStore((current) =>
      current
        ? {
            ...current,
            cancellationPolicy: [
              ...(current.cancellationPolicy ?? []),
              { hoursBefore: 24, refundPercent: 100 },
            ],
          }
        : current
    );
  }

  function updateCancellationTier(
    index: number,
    field: keyof CancellationPolicyTier,
    value: number
  ) {
    setStore((current) => {
      if (!current) {
        return current;
      }

      const tiers = [...(current.cancellationPolicy ?? [])];
      tiers[index] = { ...tiers[index], [field]: value };

      return { ...current, cancellationPolicy: tiers };
    });
  }

  function removeCancellationTier(index: number) {
    setStore((current) => {
      if (!current) {
        return current;
      }

      const tiers = (current.cancellationPolicy ?? []).filter(
        (_, tierIndex) => tierIndex !== index
      );

      return { ...current, cancellationPolicy: tiers.length > 0 ? tiers : null };
    });
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
              <p className="font-bold">キャンセルポリシー</p>

              <p className="text-xs leading-5 text-stone-500">
                予約日時の何時間前までのキャンセルなら何%返金するかを、段階を追加して設定できます。何も設定しない場合は「24時間前までは全額返金・それ以降は返金なし」が適用されます。
              </p>

              {(store.cancellationPolicy ?? []).length > 0 ? (
                <div className="space-y-2">
                  {(store.cancellationPolicy ?? []).map((tier, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-2xl border border-stone-200 p-3"
                    >
                      <input
                        type="number"
                        min={1}
                        max={720}
                        value={tier.hoursBefore}
                        onChange={(e) =>
                          updateCancellationTier(
                            index,
                            "hoursBefore",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-xl border p-2 text-center"
                      />
                      <span className="whitespace-nowrap text-sm text-stone-600">
                        時間前まで
                      </span>

                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={tier.refundPercent}
                        onChange={(e) =>
                          updateCancellationTier(
                            index,
                            "refundPercent",
                            Number(e.target.value)
                          )
                        }
                        className="w-20 rounded-xl border p-2 text-center"
                      />
                      <span className="whitespace-nowrap text-sm text-stone-600">
                        %返金
                      </span>

                      <button
                        type="button"
                        onClick={() => removeCancellationTier(index)}
                        className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-700"
                        aria-label="この段階を削除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={addCancellationTier}
                className="w-full rounded-2xl border border-dashed border-stone-300 py-3 text-center text-sm font-bold text-stone-600"
              >
                + 段階を追加
              </button>
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
