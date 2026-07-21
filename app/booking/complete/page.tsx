"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function CompletePageContent() {
  const searchParams = useSearchParams();

  const bookingNo = searchParams.get("bookingNo") || "YOYAKU-0000";
  const when = searchParams.get("when") || "今すぐ";
  const duration = searchParams.get("duration") || "60";
  const people = searchParams.get("people") || "1";
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "AIKO";
  const deposit = searchParams.get("deposit") || "1350";

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Card className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-800 text-4xl text-white">
            ✓
          </div>

          <p className="text-sm font-bold text-green-800">
            予約が完了しました
          </p>

          <h1 className="text-3xl font-bold text-stone-900">
            ありがとうございます
          </h1>

          <p className="text-sm text-stone-500">
            ご予約内容を確認メールでお送りします。
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">予約内容</h2>

          <div className="border-t border-stone-200 pt-3">
            <p className="text-sm text-stone-500">予約番号</p>
            <p className="text-xl font-bold text-stone-900">{bookingNo}</p>
          </div>

          <div>
            <p className="text-sm text-stone-500">店舗</p>
            <p className="font-bold text-stone-900">
              Sakura Thai Massage
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">日時</p>
            <p className="font-bold text-stone-900">
              {when} {time}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">施術内容</p>
            <p className="font-bold text-stone-900">
              {duration}分・{people}人
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">担当</p>
            <p className="font-bold text-stone-900">{staff}</p>
          </div>

          <div>
            <p className="text-sm text-stone-500">お支払い済み予約金</p>
            <p className="font-bold text-stone-900">
              ¥{Number(deposit).toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">当日のご案内</h2>

          <p className="text-sm text-stone-500">
            予約時間の5分前までに店舗へお越しください。
            遅れる場合は店舗へご連絡ください。
          </p>

          <div className="rounded-2xl bg-stone-100 p-4">
            <p className="text-sm font-bold text-stone-700">
              Sakura Thai Massage
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Google Mapsで開く
            </p>
          </div>
        </Card>

        <div className="space-y-3">
          <Button variant="secondary">
            Googleカレンダーに追加
          </Button>

          <Link href="/booking">
            <Button>もう一度予約する</Button>
          </Link>
        </div>

        <p className="text-center text-sm text-stone-500">
          Powered by{" "}
          <span className="font-bold text-stone-800">Yoyakus</span>
        </p>
      </div>
    </MobileFrame>
  );
}

export default function CompletePage() {
  return (
    <Suspense
      fallback={
        <MobileFrame>
          <div className="p-6 text-center text-stone-500">
            読み込み中...
          </div>
        </MobileFrame>
      }
    >
      <CompletePageContent />
    </Suspense>
  );
}
