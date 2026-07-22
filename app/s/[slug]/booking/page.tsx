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
import LanguageSwitcher from "@/components/booking/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type When = "今すぐ" | "今日" | "後日";

const WHEN_KEYS: Record<When, "now" | "today" | "later"> = {
  今すぐ: "now",
  今日: "today",
  後日: "later",
};

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
  const { locale, dictionary } = useLocale();

  const [when, setWhen] = useState<When>("今すぐ");
  const [date, setDate] = useState(getTodayDate());
  const [duration, setDuration] = useState(60);
  const [menuId, setMenuId] = useState("");
  const [menus, setMenus] = useState<ServiceMenu[]>([]);
  const [menuErrorDetail, setMenuErrorDetail] = useState<string | null>(null);
  const [menuLoadFailed, setMenuLoadFailed] = useState(false);
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
      const response = await fetch(
        `/api/public/stores/${slug}/service-menus?locale=${locale}`,
        {
          cache: "no-store",
        }
      );
      const data = (await response.json().catch(() => null)) as
        | ServiceMenu[]
        | { error?: string }
        | null;

      if (!isMounted) {
        return;
      }

      if (!response.ok || !Array.isArray(data)) {
        setMenuLoadFailed(true);
        setMenuErrorDetail(
          data && !Array.isArray(data) && data.error ? data.error : null
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
  }, [slug, locale]);

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

  const menuError = menuLoadFailed
    ? menuErrorDetail || dictionary.bookingMenu.menuError
    : "";

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

  function categoryLabel(key: string) {
    return key || dictionary.bookingMenu.uncategorizedLabel;
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
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-800 bg-white px-3 py-1.5 text-xs font-medium text-green-800 transition active:scale-[0.98]"
          >
            {dictionary.bookingMenu.storeOwnerLink}
            <span aria-hidden="true">→</span>
          </Link>

          <LanguageSwitcher />
        </div>

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
              <h1 className="text-2xl font-semibold text-stone-900">
                {store.name}
              </h1>

              {store.address || store.phone || store.websiteUrl ? (
                <div className="space-y-1.5 border-t border-stone-100 pt-3 text-sm font-bold">
                  {store.address ? (
                    <div className="flex items-start gap-2.5 text-[#FF440D]">
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
                      className="flex items-center gap-2.5 text-[#FF440D] transition active:opacity-70"
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
                      className="flex items-center gap-2.5 text-[#FF440D]"
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
              {dictionary.bookingMenu.when[WHEN_KEYS[label]]}
            </Button>
          ))}
        </div>

        <Card className="space-y-5">
          <h2 className="text-2xl font-bold text-stone-900">
            {dictionary.bookingMenu.bookingDetails}
          </h2>

          {when === "後日" ? (
            <div>
              <label
                htmlFor="booking-date"
                className="text-sm font-bold text-stone-700"
              >
                {dictionary.bookingMenu.bookingDate}
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
              {dictionary.bookingMenu.menuHeading}
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
                        {categoryLabel(key)}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-3 pt-2">
                  <h4 className="flex items-center gap-1.5 text-xl font-bold text-stone-800">
                    <Icon name="clock" className="h-4 w-4 text-stone-400" />
                    {dictionary.bookingMenu.durationHeading}
                  </h4>

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
                          {dictionary.bookingMenu.durationLabel(menu.durationMinutes)}・¥
                          {menu.price.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
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
                {dictionary.bookingMenu.peopleHeading}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((count) => (
                  <Button
                    key={count}
                    variant={people === count ? "primary" : "secondary"}
                    onClick={() => setPeople(count)}
                  >
                    {dictionary.bookingMenu.peopleCount(count)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-stone-100 via-stone-100/95 to-transparent pb-6 pt-8">
          <div className="w-full max-w-[398px] px-4">
            <Link href={availabilityUrl}>
              <Button size="lg">{dictionary.bookingMenu.availabilityCta}</Button>
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
