"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CompletePage() {
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const duration = searchParams.get("duration") || "60";
  const people = searchParams.get("people") || "1";
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "AIKO";
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const deposit = searchParams.get("deposit") || "1350";
  const bookingNumber =
    searchParams.get("bookingNumber") || "YOYAKU-00000001";

  const safeDeposit = Number.isFinite(Number(deposit))
    ? Number(deposit)
    : 1350;

  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Sakura Thai Massage");

  const calendarUrl = useMemo(() => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Sakura Thai Massage ご予約",
      details: [
        `予約番号: ${bookingNumber}`,
        `施術時間: ${duration}分`,
        `人数: ${people}人`,
        `担当: ${staff}`,
      ].join("\n"),
      location: "Sakura Thai Massage",
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, [bookingNumber, duration, people, staff]);

  return (
    <MobileFrame>
      <main className="min-h-screen bg-stone-100">
        <div className="mx-auto w-full max-w-[430px] px-4 pb-10 pt-8">
          <section className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-800 text-4xl font-black text-white shadow-lg shadow-green-900/20">
              <span aria-hidden="true">✓</span>
            </div>

            <p className="mt-5 text-sm font-bold text-green-800">
              予約が完了しました
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900">
              ありがとうございます
            </h1>

            <p className="mt-3 text-sm leading-6 text-stone-600">
              {email
                ? `${email}へ予約確認メールをお送りします。`
                : "ご予約内容を確認メールでお送りします。"}
            </p>
          </section>

          <Card className="mt-7">
            <h2 className="text-lg font-black text-stone-900">予約内容</h2>

            <dl className="mt-4 divide-y divide-stone-200">
              <div className="py-3">
                <dt className="text-xs font-bold text-stone-500">予約番号</dt>
                <dd className="mt-1 break-all text-lg font-black tracking-wide text-green-800">
                  {bookingNumber}
                </dd>
              </div>

              {name && (
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-sm text-stone-500">予約者</dt>
                  <dd className="text-right text-sm font-bold text-stone-900">
                    {name} 様
                  </dd>
                </div>
              )}

              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-stone-500">店舗</dt>
                <dd className="text-right text-sm font-bold text-stone-900">
                  Sakura Thai Massage
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-stone-500">日時</dt>
                <dd className="text-right text-sm font-bold text-stone-900">
                  {when} {time}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-stone-500">施術内容</dt>
                <dd className="text-right text-sm font-bold text-stone-900">
                  {duration}分・{people}人
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-stone-500">担当</dt>
                <dd className="max-w-[65%] text-right text-sm font-bold text-stone-900">
                  {staff}
                </dd>
              </div>

              <div className="flex items-end justify-between gap-4 py-4">
                <dt>
                  <p className="text-sm font-bold text-stone-900">
                    お支払い済み予約金
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    施術料金に充当されます
                  </p>
                </dt>

                <dd className="text-xl font-black text-green-800">
                  ¥{safeDeposit.toLocaleString()}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="mt-4">
            <h2 className="text-lg font-black text-stone-900">当日のご案内</h2>

            <ul className="mt-3 space-y-3 text-sm leading-6 text-stone-600">
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-black text-green-800"
                >
                  1
                </span>

                <span>予約時間の5分前までに店舗へお越しください。</span>
              </li>

              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-black text-green-800"
                >
                  2
                </span>

                <span>遅れる場合は、できるだけ早く店舗へご連絡ください。</span>
              </li>

              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-black text-green-800"
                >
                  3
                </span>

                <span>
                  当日は施術料金から予約金を差し引いた残額をお支払いください。
                </span>
              </li>
            </ul>
          </Card>

          <Card className="mt-4">
            <p className="text-sm font-black text-stone-900">
              Sakura Thai Massage
            </p>

            <p className="mt-1 text-sm leading-6 text-stone-500">
              店舗の所在地と詳しいアクセスは、地図でご確認ください。
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center justify-center rounded-xl border border-green-800 bg-white px-4 py-3 text-center text-sm font-black text-green-800 transition active:scale-[0.99]"
              >
                Google Mapsで開く
              </a>

              <a
                href={calendarUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center justify-center rounded-xl border border-green-800 bg-white px-4 py-3 text-center text-sm font-black text-green-800 transition active:scale-[0.99]"
              >
                カレンダーに追加
              </a>
            </div>
          </Card>

          <div className="mt-6">
            <Link href="/">
              <Button>もう一度予約する</Button>
            </Link>
          </div>

          <footer className="mt-10 text-center">
            <p className="text-xs text-stone-400">
              Powered by{" "}
              <span className="font-black text-green-800">Yoyaku</span>
            </p>
          </footer>
        </div>
      </main>
    </MobileFrame>
  );
}