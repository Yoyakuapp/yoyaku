"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";

type StoreInfo = {
  name: string;
  phone: string | null;
  whatsappNumber: string | null;
  allowPhoneBooking: boolean;
  allowWhatsappBooking: boolean;
  allowYoyakuBooking: boolean;
  requiresDeposit: boolean;
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
          className="text-sm font-bold text-stone-500"
        >
          ← 空き時間に戻る
        </Link>

        <Card className="space-y-4">
          <p className="text-sm font-bold text-green-800">
            {store?.name ?? "読み込んでいます..."}
          </p>

          <h1 className="text-3xl font-bold text-stone-900">予約内容の確認</h1>

          <div className="space-y-3 border-t border-stone-200 pt-4">
            <div>
              <p className="text-sm text-stone-500">予約日</p>
              <p className="text-xl font-bold text-stone-900">
                {formatDate(date)}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">予約タイミング</p>
              <p className="text-xl font-bold text-stone-900">{when}</p>
            </div>

            <div>
              <p className="text-sm text-stone-500">開始時間</p>
              <p className="text-xl font-bold text-stone-900">{time}</p>
            </div>

            <div>
              <p className="text-sm text-stone-500">施術時間</p>
              <p className="text-xl font-bold text-stone-900">{duration}分</p>
            </div>

            <div>
              <p className="text-sm text-stone-500">人数</p>
              <p className="text-xl font-bold text-stone-900">{people}人</p>
            </div>

            <div>
              <p className="text-sm text-stone-500">担当</p>
              <p className="text-xl font-bold text-stone-900">{staff}</p>
            </div>
          </div>
        </Card>

        {menu ? (
          <Card className="space-y-3">
            <h2 className="text-xl font-bold text-stone-900">料金</h2>

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
              className="block rounded-2xl bg-stone-800 px-4 py-3 text-center text-sm font-bold text-white"
            >
              電話する（{store.phone}）
            </a>
          ) : null}

          {store?.allowWhatsappBooking && store.whatsappNumber ? (
            <a
              href={toWhatsappLink(store.whatsappNumber)}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-bold text-white"
            >
              WhatsAppで連絡する
            </a>
          ) : null}

          {store?.allowYoyakuBooking ? (
            store.requiresDeposit ? (
              <p className="rounded-2xl bg-stone-100 px-4 py-3 text-center text-sm font-bold text-stone-500">
                この店舗のオンライン予約は準備中です。電話またはWhatsAppでご連絡ください。
              </p>
            ) : (
              <Link
                href={`/s/${slug}/booking/customer?${customerParams.toString()}`}
                className="block rounded-2xl border border-green-800 bg-green-800 px-4 py-3 text-center text-sm font-bold text-white"
              >
                このまま予約する
              </Link>
            )
          ) : null}
        </Card>
      </div>
    </MobileFrame>
  );
}
