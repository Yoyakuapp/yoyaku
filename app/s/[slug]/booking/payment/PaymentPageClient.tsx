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
