"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const duration = searchParams.get("duration") || "60";
  const people = searchParams.get("people") || "1";
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "AIKO";

  const pricePerPerson = Number(duration) * 150;
  const totalPrice = pricePerPerson * Number(people);
  const deposit = Math.round(totalPrice * 0.15);

  const completeUrl = `/booking/complete?when=${encodeURIComponent(
    when
  )}&duration=${duration}&people=${people}&time=${time}&staff=${encodeURIComponent(
    staff
  )}&deposit=${deposit}`;

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <Link
          href={`/booking/customer?when=${encodeURIComponent(
            when
          )}&duration=${duration}&people=${people}&time=${time}&staff=${encodeURIComponent(
            staff
          )}`}
          className="text-sm font-bold text-stone-500"
        >
          ← 予約者情報に戻る
        </Link>

        <Card className="space-y-4">
          <p className="text-sm font-bold text-green-800">
            Sakura Thai Massage
          </p>

          <h1 className="text-3xl font-bold text-stone-900">
            デポジット支払い
          </h1>

          <p className="text-sm text-stone-500">
            予約確定のため、予約金をお支払いください。
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">
            お支払い内容
          </h2>

          <div className="flex justify-between text-stone-700">
            <span>予約内容</span>
            <span>
              {duration}分・{people}人
            </span>
          </div>

          <div className="flex justify-between text-stone-700">
            <span>開始時間</span>
            <span>{time}</span>
          </div>

          <div className="flex justify-between text-stone-700">
            <span>担当</span>
            <span>{staff}</span>
          </div>

          <div className="border-t border-stone-200 pt-3">
            <div className="flex justify-between text-stone-700">
              <span>施術料金</span>
              <span>¥{totalPrice.toLocaleString()}</span>
            </div>

            <div className="mt-2 flex justify-between text-xl font-bold text-stone-900">
              <span>予約金 15%</span>
              <span>¥{deposit.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-stone-500">
            予約金は当日の施術料金に充当されます。
          </p>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900">
            カード情報
          </h2>

          <div>
            <label className="text-sm font-bold text-stone-700">
              カード番号
            </label>
            <input
              placeholder="4242 4242 4242 4242"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-stone-700">
                有効期限
              </label>
              <input
                placeholder="MM / YY"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-stone-700">
                CVC
              </label>
              <input
                placeholder="123"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>
          </div>

          <p className="text-xs text-stone-500">
            ※ 現在はテスト画面です。次の段階でStripe決済に接続します。
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-stone-900">
            キャンセルについて
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            24時間前までのキャンセルは予約金を返金します。
            24時間以内のキャンセルは予約金を返金できません。
          </p>
        </Card>

        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
          <Link href={completeUrl}>
            <Button>予約金を支払って確定</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}