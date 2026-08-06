"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type StoreInfo = {
  name: string;
  phone: string | null;
};

type ServiceMenu = {
  id: string;
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

export default function ConfirmPage() {
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

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [storeResponse, menusResponse] = await Promise.all([
        fetch("/api/public/store", { cache: "no-store" }),
        fetch("/api/service-menus", { cache: "no-store" }),
      ]);

      if (!isMounted) {
        return;
      }

      if (storeResponse.ok) {
        const storeData = (await storeResponse.json().catch(() => null)) as
          | StoreInfo
          | null;

        if (storeData) {
          setStore(storeData);
        }
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
  }, [menuId, duration]);

  const totalPrice = menu?.price ?? 0;
  const deposit = menu?.deposit ?? 0;

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
          href={`/booking/availability?${availabilityParams.toString()}`}
          className="text-sm font-bold text-stone-500"
        >
          ← 空き時間に戻る
        </Link>

        <Card className="space-y-4">
          <p className="text-sm font-bold text-green-800">
            {store?.name ?? "読み込み中..."}
          </p>

          <h1 className="text-3xl font-bold text-stone-900">
            予約内容の確認
          </h1>

          <div className="space-y-3 border-t border-stone-200 pt-4">
            <div>
              <p className="text-sm text-stone-500">予約日</p>
              <p className="text-xl font-bold text-stone-900">
                {formatDate(date)}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">予約タイミング</p>
              <p className="text-xl font-bold text-stone-900">
                {when}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">開始時間</p>
              <p className="text-xl font-bold text-stone-900">
                {time}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">施術時間</p>
              <p className="text-xl font-bold text-stone-900">
                {duration}分
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">人数</p>
              <p className="text-xl font-bold text-stone-900">
                {people}人
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">担当</p>
              <p className="text-xl font-bold text-stone-900">
                {staff}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">
            料金
          </h2>

          <div className="flex justify-between text-stone-700">
            <span>施術料金</span>
            <span>¥{totalPrice.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-stone-700">
            <span>予約金</span>
            <span>¥{deposit.toLocaleString()}</span>
          </div>

          <p className="text-xs text-stone-500">
            予約金は当日の施術料金に充当されます。
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-stone-900">
            キャンセルポリシー
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            24時間前までのキャンセルは予約金を返金します。
            24時間以内のキャンセルは予約金を返金できません。
          </p>
        </Card>

        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
          <Link href={`/booking/customer?${customerParams.toString()}`}>
            <Button>予約者情報へ進む</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}

