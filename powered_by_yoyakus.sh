cat > "app/booking/page.tsx" << 'YOYAKU_EOF'
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import MobileFrame from "@/components/layout/MobileFrame";
import StoreHeader from "@/components/booking/StoreHeader";
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

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingPage() {
  const [when, setWhen] = useState<When>("今すぐ");
  const [date, setDate] = useState(getTodayDate());
  const [duration, setDuration] = useState(60);
  const [menuId, setMenuId] = useState("");
  const [menus, setMenus] = useState<ServiceMenu[]>([]);
  const [menuError, setMenuError] = useState("");
  const [people, setPeople] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadMenus() {
      const response = await fetch("/api/service-menus", {
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
  }, []);

  const selectedDate =
    when === "後日" ? date : getTodayDate();

  const params = new URLSearchParams({
    when,
    date: selectedDate,
    duration: String(duration),
    people: String(people),
  });

  if (menuId) {
    params.set("menuId", menuId);
  }

  const availabilityUrl = `/booking/availability?${params.toString()}`;

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <StoreHeader />

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
          <h2 className="text-2xl font-bold text-stone-900">
            予約内容
          </h2>

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
            <h3 className="text-xl font-bold text-stone-800">
              メニュー
            </h3>

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
                    variant={
                      people === count ? "primary" : "secondary"
                    }
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
          Powered by{" "}
          <span className="font-bold text-stone-800">
            Yoyakus
          </span>
        </p>
      </div>
    </MobileFrame>
  );
}
YOYAKU_EOF

cat > "app/booking/complete/page.tsx" << 'YOYAKU_EOF'
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
YOYAKU_EOF

mkdir -p "app/s/[slug]/booking/complete"
cat > "app/s/[slug]/booking/complete/CompletePageClient.tsx" << 'YOYAKU_EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SpaIllustration from "@/components/booking/SpaIllustration";

export default function CompletePageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const searchParams = useSearchParams();

  const bookingNo = searchParams.get("bookingNo") || "";
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStore() {
      const response = await fetch(`/api/public/stores/${slug}`, {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | { name: string }
        | null;

      if (isMounted && response.ok && data) {
        setStoreName(data.name);
      }
    }

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8 pt-4">
        <Card className="space-y-3 text-center">
          <SpaIllustration className="mx-auto h-24 w-24" />

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-800 text-white">
            <Icon name="check" className="h-6 w-6" />
          </div>

          <p className="text-sm font-bold text-green-800">予約が完了しました</p>

          <h1 className="text-3xl font-bold text-stone-900">
            ありがとうございます
          </h1>

          <p className="text-sm text-stone-500">
            ご予約内容を確認メールでお送りします。
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">予約内容</h2>

          <div className="flex items-start gap-2.5 border-t border-stone-200 pt-3 text-stone-600">
            <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
            <div>
              <p className="text-sm text-stone-500">予約番号</p>
              <p className="text-xl font-bold text-stone-900">{bookingNo}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-stone-600">
            <Icon name="location" className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
            <div>
              <p className="text-sm text-stone-500">店舗</p>
              <p className="font-bold text-stone-900">{storeName}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="info" className="h-5 w-5 text-green-800" />
            <h2 className="text-xl font-bold text-stone-900">当日のご案内</h2>
          </div>

          <p className="text-sm text-stone-500">
            予約時間の5分前までに店舗へお越しください。
            遅れる場合は店舗へご連絡ください。
          </p>
        </Card>

        <div className="space-y-3">
          <Link href={`/s/${slug}/booking`}>
            <Button>もう一度予約する</Button>
          </Link>
        </div>

        <p className="text-center text-sm text-stone-500">
          Powered by <span className="font-bold text-stone-800">Yoyakus</span>
        </p>
      </div>
    </MobileFrame>
  );
}
YOYAKU_EOF

mkdir -p "app/s/[slug]/booking"
cat > "app/s/[slug]/booking/page.tsx" << 'YOYAKU_EOF'
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";
import PhotoGallery from "@/components/booking/PhotoGallery";

type When = "今すぐ" | "今日" | "後日";

type ServiceMenu = {
  id: string;
  name: string;
  category: string | null;
  description: string;
  durationMinutes: number;
  price: number;
  deposit: number;
  currency: string;
};

const UNCATEGORIZED_KEY = "";
const UNCATEGORIZED_LABEL = "その他";

type StoreInfo = {
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
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
  const [selectedCategory, setSelectedCategory] = useState(UNCATEGORIZED_KEY);

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
        setSelectedCategory(firstMenu.category?.trim() || UNCATEGORIZED_KEY);
      }
    }

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const menusByCategory = useMemo(() => {
    const map = new Map<string, ServiceMenu[]>();

    for (const menu of menus) {
      const key = menu.category?.trim() || UNCATEGORIZED_KEY;
      const group = map.get(key) ?? [];
      group.push(menu);
      map.set(key, group);
    }

    return map;
  }, [menus]);

  const categoryKeys = Array.from(menusByCategory.keys());
  const showCategorySelector = categoryKeys.length > 1;
  const visibleMenus = showCategorySelector
    ? menusByCategory.get(selectedCategory) ?? []
    : menus;

  function selectCategory(key: string) {
    setSelectedCategory(key);

    const firstInCategory = menusByCategory.get(key)?.[0];

    if (firstInCategory) {
      setMenuId(firstInCategory.id);
      setDuration(firstInCategory.durationMinutes);
    }
  }

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
      <div className="space-y-4 pb-32 pt-4">
        {store ? (
          <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5">
            {(() => {
              const galleryUrls =
                store.imageUrls.length > 0
                  ? store.imageUrls
                  : store.imageUrl
                    ? [store.imageUrl]
                    : [];

              return (
                <PhotoGallery
                  images={galleryUrls}
                  alt={store.name}
                  heightClassName="h-52"
                />
              );
            })()}

            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-stone-900">
                  {store.name}
                </h1>

                <Link
                  href="/login"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-800 px-3 py-1.5 text-xs font-medium text-green-800 transition active:scale-[0.98]"
                >
                  お店の方はこちら
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {store.address || store.phone || store.websiteUrl ? (
                <div className="space-y-1.5 border-t border-stone-100 pt-3 text-sm font-light">
                  {store.address ? (
                    <div className="flex items-start gap-2.5 text-stone-600">
                      <Icon
                        name="location"
                        className="mt-0.5 h-4 w-4 shrink-0 text-stone-400"
                      />
                      <p>{store.address}</p>
                    </div>
                  ) : null}

                  {store.phone ? (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex items-center gap-2.5 text-stone-600 transition active:opacity-70"
                    >
                      <Icon name="phone" className="h-4 w-4 shrink-0 text-stone-400" />
                      <span className="underline decoration-stone-300 underline-offset-2">
                        {store.phone}
                      </span>
                    </a>
                  ) : null}

                  {store.websiteUrl ? (
                    <a
                      href={store.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 font-medium text-green-800"
                    >
                      <Icon name="chevron-right" className="h-4 w-4 shrink-0" />
                      {store.websiteUrl}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white p-4 shadow-md ring-1 ring-black/5">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="mt-4 h-5 w-2/3" />
          </div>
        )}

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
            <h3 className="flex items-center gap-1.5 text-xl font-bold text-stone-800">
              <Icon name="star" className="h-4 w-4 text-stone-400" />
              メニュー
            </h3>

            {menuError ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {menuError}
              </p>
            ) : menus.length > 0 ? (
              <div className="space-y-4">
                {showCategorySelector ? (
                  <div className="flex flex-wrap gap-2">
                    {categoryKeys.map((key) => (
                      <button
                        key={key || "__uncategorized__"}
                        type="button"
                        onClick={() => selectCategory(key)}
                        className={
                          selectedCategory === key
                            ? "rounded-full border border-green-800 bg-green-800 px-4 py-2 text-sm font-bold text-white"
                            : "rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700"
                        }
                      >
                        {key || UNCATEGORIZED_LABEL}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-3">
                  {visibleMenus.map((menu) => (
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
                      <span className="mt-1 flex items-center gap-1 text-sm opacity-80">
                        <Icon name="clock" className="h-3.5 w-3.5" />
                        {menu.durationMinutes}分・¥{menu.price.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            )}
          </div>

          <div className="border-t border-stone-200 pt-5">
            <div className="space-y-4">
              <h3 className="flex items-center gap-1.5 text-xl font-bold text-stone-800">
                <Icon name="users" className="h-4 w-4 text-stone-400" />
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

        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-stone-100 via-stone-100/95 to-transparent pb-6 pt-8">
          <div className="w-full max-w-[398px] px-4">
            <Link href={availabilityUrl}>
              <Button size="lg">空き時間を見る</Button>
            </Link>
          </div>
        </div>

        <p className="pb-16 text-center text-sm text-stone-500">
          Powered by <span className="font-bold text-stone-800">Yoyakus</span>
        </p>
      </div>
    </MobileFrame>
  );
}
YOYAKU_EOF
