"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type StoreInfo = {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  description: string | null;
  imageUrl: string | null;
  whatsappNumber: string | null;
  allowPhoneBooking: boolean;
  allowWhatsappBooking: boolean;
  allowYoyakuBooking: boolean;
  isPublished: boolean;
  slug: string;
};

const textFields: [string, keyof StoreInfo][] = [
  ["店舗名", "name"],
  ["電話番号", "phone"],
  ["メールアドレス", "email"],
  ["住所", "address"],
  ["郵便番号", "postalCode"],
  ["市区町村", "city"],
  ["WhatsApp番号", "whatsappNumber"],
  ["画像URL", "imageUrl"],
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

  return (
    <MobileFrame>
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

            {textFields.map(([label, key]) => (
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
    </MobileFrame>
  );
}
