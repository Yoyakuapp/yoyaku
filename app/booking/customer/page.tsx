"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CustomerPage() {
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const duration = searchParams.get("duration") || "60";
  const people = searchParams.get("people") || "1";
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "AIKO";

  const paymentUrl = `/booking/payment?when=${encodeURIComponent(
    when
  )}&duration=${duration}&people=${people}&time=${time}&staff=${encodeURIComponent(
    staff
  )}`;

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <Link
          href={`/booking/confirm?when=${encodeURIComponent(
            when
          )}&duration=${duration}&people=${people}&time=${time}&staff=${encodeURIComponent(
            staff
          )}`}
          className="text-sm font-bold text-stone-500"
        >
          ← 予約内容に戻る
        </Link>

        <Card className="space-y-4">
          <p className="text-sm font-bold text-green-800">
            Sakura Thai Massage
          </p>

          <h1 className="text-3xl font-bold text-stone-900">
            予約者情報
          </h1>

          <p className="text-sm text-stone-500">
            予約確認のため、連絡先を入力してください。
          </p>
        </Card>

        <Card className="space-y-4">
          <div>
            <label className="text-sm font-bold text-stone-700">
              お名前
            </label>
            <input
              placeholder="例：山田 太郎"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              電話番号
            </label>
            <input
              placeholder="例：09012345678"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              メールアドレス
            </label>
            <input
              placeholder="例：name@example.com"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              ご要望・メモ
            </label>
            <textarea
              placeholder="例：肩を重点的にお願いします"
              rows={4}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>
        </Card>

        <Card>
          <p className="text-sm text-stone-500">
            次の画面で予約金をお支払いください。
            予約金は当日の施術料金に充当されます。
          </p>
        </Card>

        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
          <Link href={paymentUrl}>
            <Button>デポジット支払いへ</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}