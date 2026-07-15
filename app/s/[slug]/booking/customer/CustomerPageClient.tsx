"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";

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
              <div>
                <p className="text-xs font-bold text-stone-500">予約日時</p>

                <p className="mt-1 text-base font-black text-stone-900">
                  {formatDate(date)} {time}
                </p>

                <p className="mt-1 text-xs text-stone-500">{when}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-stone-200 pt-4">
                <div>
                  <p className="text-xs text-stone-500">施術時間</p>

                  <p className="mt-1 font-bold text-stone-900">{duration}分</p>
                </div>

                <div>
                  <p className="text-xs text-stone-500">人数</p>

                  <p className="mt-1 font-bold text-stone-900">{people}人</p>
                </div>

                <div>
                  <p className="text-xs text-stone-500">担当</p>

                  <p className="mt-1 truncate font-bold text-stone-900">
                    {staff}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} noValidate>
            <Card className="mt-4">
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-sm font-bold text-stone-800"
                  >
                    お名前
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <input
                    id="customer-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="山田 太郎"
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-phone"
                    className="block text-sm font-bold text-stone-800"
                  >
                    電話番号
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <input
                    id="customer-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="090-1234-5678"
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-email"
                    className="block text-sm font-bold text-stone-800"
                  >
                    メールアドレス
                    <span className="ml-1 text-red-600">*</span>
                  </label>

                  <input
                    id="customer-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@email.com"
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-stone-500">
                    予約確認メールをこのアドレスへ送信します。
                  </p>
                </div>

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
                    className="mt-2 w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-green-800 bg-green-800 px-4 py-4 text-base font-black text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60"
              >
                {isSubmitting ? "予約しています..." : "予約を確定する"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </MobileFrame>
  );
}
