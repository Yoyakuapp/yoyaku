"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";

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

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);

  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const date = searchParams.get("date") || getTodayDate();
  const duration = Number(searchParams.get("duration") || 60);
  const people = Number(searchParams.get("people") || 1);
  const time = searchParams.get("time") || "10:00";
  const staff = searchParams.get("staff") || "担当者未指定";
  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";
  const note = searchParams.get("note") || "";

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState(name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 60;

  const safePeople =
    Number.isFinite(people) && people > 0 ? people : 1;

  const pricePerPerson = safeDuration * 150;
  const totalPrice = pricePerPerson * safePeople;
  const deposit = Math.round(totalPrice * 0.15);
  const remainingPrice = totalPrice - deposit;

  const customerUrl = useMemo(() => {
    const params = new URLSearchParams({
      when,
      date,
      duration: String(safeDuration),
      people: String(safePeople),
      time,
      staff,
      name,
      phone,
      email,
    });

    if (note) {
      params.set("note", note);
    }

    return `/booking/customer?${params.toString()}`;
  }, [
    when,
    date,
    safeDuration,
    safePeople,
    time,
    staff,
    name,
    phone,
    email,
    note,
  ]);

  function validatePaymentForm() {
    const cardDigits = cardNumber.replace(/\s/g, "");
    const expiryDigits = expiry.replace(/\D/g, "");

    if (!cardholderName.trim()) {
      return "カード名義人を入力してください。";
    }

    if (!/^\d{16}$/.test(cardDigits)) {
      return "カード番号を16桁で入力してください。";
    }

    if (!/^\d{4}$/.test(expiryDigits)) {
      return "有効期限を月2桁・年2桁で入力してください。";
    }

    const month = Number(expiryDigits.slice(0, 2));

    if (month < 1 || month > 12) {
      return "有効期限の月を正しく入力してください。";
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      return "セキュリティコードを正しく入力してください。";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const validationError = validatePaymentForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!name || !phone || !email) {
      setError("予約者情報が不足しています。前の画面へ戻ってください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingDate = new Date(`${date}T${time}:00.000Z`);

      if (Number.isNaN(bookingDate.getTime())) {
        setError("予約日時が正しくありません。");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: name,
          email,
          phone,
          memo: note,
          date: bookingDate.toISOString(),
          duration: safeDuration,
          people: safePeople,
          staff,
          menu: `${safeDuration}分コース`,
          amount: totalPrice,
          deposit,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | BookingResponse
        | { error?: string }
        | null;

      if (!response.ok || !data || !("bookingNo" in data)) {
        setError(
          data && "error" in data && data.error
            ? data.error
            : "予約の保存に失敗しました。"
        );
        setIsSubmitting(false);
        return;
      }

      const completeParams = new URLSearchParams({
        bookingId: data.id,
        bookingNumber: data.bookingNo,
        when,
        date,
        duration: String(safeDuration),
        people: String(safePeople),
        time,
        staff,
        name,
        phone,
        email,
        deposit: String(deposit),
        totalPrice: String(totalPrice),
      });

      if (note) {
        completeParams.set("note", note);
      }

      router.push(`/booking/complete?${completeParams.toString()}`);
    } catch {
      setError("予約処理中にエラーが発生しました。");
      setIsSubmitting(false);
    }
  }

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
            <p className="text-sm font-bold text-green-800">
              Sakura Thai Massage
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-900">
              デポジット支払い
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
                <dt className="text-sm text-stone-500">予約日時</dt>

                <dd className="text-right text-sm font-bold text-stone-900">
                  {formatDate(date)}
                  <br />
                  {time}
                </dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-stone-500">予約内容</dt>

                <dd className="text-right text-sm font-bold text-stone-900">
                  {safeDuration}分・{safePeople}人
                </dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="text-sm text-stone-500">担当</dt>

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
                    本日のお支払い
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    予約金 15%
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
                    htmlFor="card-number"
                    className="block text-sm font-bold text-stone-800"
                  >
                    カード番号
                  </label>

                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cardNumber}
                    onChange={(event) =>
                      setCardNumber(
                        formatCardNumber(event.target.value)
                      )
                    }
                    placeholder="1234 5678 9012 3456"
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base tracking-wide text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="card-expiry"
                      className="block text-sm font-bold text-stone-800"
                    >
                      有効期限
                    </label>

                    <input
                      id="card-expiry"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={expiry}
                      onChange={(event) =>
                        setExpiry(formatExpiry(event.target.value))
                      }
                      placeholder="MM/YY"
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="card-cvc"
                      className="block text-sm font-bold text-stone-800"
                    >
                      CVC
                    </label>

                    <input
                      id="card-cvc"
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                      value={cvc}
                      onChange={(event) =>
                        setCvc(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4)
                        )
                      }
                      placeholder="123"
                      className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-stone-100 px-4 py-3">
                <span aria-hidden="true" className="mt-0.5">
                  🔒
                </span>

                <p className="text-xs leading-5 text-stone-600">
                  現在は開発確認用の仮決済画面です。
                  Stripe本番連携は次の段階で実装します。
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
                現在は開発確認用です。実際のカード決済は行われません。
              </p>
            </div>
          </form>
        </div>
      </main>
    </MobileFrame>
  );
}