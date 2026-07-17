"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type When = "今すぐ" | "今日" | "後日";

type ServiceMenu = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  deposit: number;
  currency: string;
};

type StoreInfo = {
  name: string;
  imageUrl: string | null;
  imageUrls: string[];
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function StoreBookingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [when, setWhen] = useState<When>("今すぐ");
  const [date, setDate] = useState(getTodayDate());
  const [duration, setDuration] = useState(60);
  const [menuId, setMenuId] = useState("");
  const [menus, setMenus] = useState<ServiceMenu[]>([]);
  const [menuError, setMenuError] = useState("");
  const [people, setPeople] = useState(1);
  const [store, setStore] = useState<StoreInfo | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStore() {
      const response = await fetch(`/api/public/stores/${slug}`, {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | StoreInfo
        | null;

      if (!isMounted || !response.ok || !data) {
        return;
      }

      setStore(data);
    }

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    async function loadMenus() {
      const response = await fetch(`/api/public/stores/${slug}/service-menus`, {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | ServiceMenu[]
        | { error?: string }
        | null;

      if (!isMounted) {
        return;
      }

      if (!response.ok || !Array.isArray(data)) {
        setMenuError(
          data && !Array.isArray(data) && data.error
            ? data.error
            : "メニューを取得できませんでした。"
        );
        return;
      }

      setMenus(data);

      const firstMenu = data[0];

      if (firstMenu) {
        setMenuId(firstMenu.id);
        setDuration(firstMenu.durationMinutes);
      }
    }

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const selectedDate = when === "後日" ? date : getTodayDate();

  const params2 = new URLSearchParams({
    when,
    date: selectedDate,
    duration: String(duration),
    people: String(people),
  });

  if (menuId) {
    params2.set("menuId", menuId);
  }

  const availabilityUrl = `/s/${slug}/booking/availability?${params2.toString()}`;

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <Link href={`/s/${slug}`} className="text-sm font-bold text-stone-500">
          ← 店舗トップ
        </Link>

        {store ? (
          <div className="overflow-hidden rounded-3xl bg-white shadow-md">
            {(() => {
              const galleryUrls =
                store.imageUrls.length > 0
                  ? store.imageUrls
                  : store.imageUrl
                    ? [store.imageUrl]
                    : [];

              return galleryUrls.length > 0 ? (
                <div className="flex snap-x snap-mandatory overflow-x-auto">
                  {galleryUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt={store.name}
                      className="h-40 w-full shrink-0 snap-center object-cover"
                    />
                  ))}
                </div>
              ) : null;
            })()}

            <div className="flex items-center justify-between gap-3 p-4">
              <h1 className="text-lg font-bold text-stone-900">
                {store.name}
              </h1>

              <Link
                href="/login"
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-800 px-3 py-1.5 text-xs font-bold text-green-800 transition active:scale-[0.98]"
              >
                お店の方はこちら
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          {(["今すぐ", "今日", "後日"] as When[]).map((label) => (
            <Button
              key={label}
              variant={when === label ? "primary" : "secondary"}
              onClick={() => setWhen(label)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Card className="space-y-5">
          <h2 className="text-2xl font-bold text-stone-900">予約内容</h2>

          {when === "後日" ? (
            <div>
              <label
                htmlFor="booking-date"
                className="text-sm font-bold text-stone-700"
              >
                予約日
              </label>

              <input
                id="booking-date"
                type="date"
                value={date}
                min={getTodayDate()}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>
          ) : null}

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-stone-800">メニュー</h3>

            {menuError ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {menuError}
              </p>
            ) : menus.length > 0 ? (
              <div className="space-y-3">
                {menus.map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => {
                      setMenuId(menu.id);
                      setDuration(menu.durationMinutes);
                    }}
                    className={
                      menuId === menu.id
                        ? "w-full rounded-2xl border border-green-800 bg-green-800 px-4 py-3 text-left text-white"
                        : "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left text-stone-900"
                    }
                  >
                    <span className="block font-bold">{menu.name}</span>
                    <span className="mt-1 block text-sm opacity-80">
                      {menu.durationMinutes}分・¥{menu.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700">
                メニューを読み込んでいます...
              </p>
            )}
          </div>

          <div className="border-t border-stone-200 pt-5">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-800">
                何人で受けますか？
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((count) => (
                  <Button
                    key={count}
                    variant={people === count ? "primary" : "secondary"}
                    onClick={() => setPeople(count)}
                  >
                    {count}人
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
          <Link href={availabilityUrl}>
            <Button>空き時間を見る</Button>
          </Link>
        </div>

        <p className="pb-16 text-center text-sm text-stone-500">
          Powered by <span className="font-bold text-stone-800">Yoyaku</span>
        </p>
      </div>
    </MobileFrame>
  );
}
