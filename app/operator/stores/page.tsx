"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import OperatorGate from "@/components/operator/OperatorGate";

type Store = {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string | null;
  address: string | null;
  isActive: boolean;
  isPublished: boolean;
  allowPhoneBooking: boolean;
  allowWhatsappBooking: boolean;
  allowYoyakuBooking: boolean;
  createdAt: string;
};

function groupStoresByCountry(stores: Store[]) {
  const groups = new Map<string, Store[]>();

  for (const store of stores) {
    const key = store.country || "不明";
    const list = groups.get(key) ?? [];
    list.push(store);
    groups.set(key, list);
  }

  return Array.from(groups.entries());
}

export default function OperatorStoresPage() {
  return (
    <MobileFrame>
      <OperatorGate>
        {(password) => <StoresPanel password={password} />}
      </OperatorGate>
    </MobileFrame>
  );
}

function StoresPanel({ password }: { password: string }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const hasLoadedRef = useRef(false);

  async function loadStores(q: string, country: string) {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ password });
      if (q) {
        params.set("q", q);
      }
      if (country) {
        params.set("country", country);
      }

      const response = await fetch(`/api/operator/stores?${params}`);

      if (!response.ok) {
        setError("店舗一覧の読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as { stores: Store[] };
      setStores(data.stores);

      if (!q && !country) {
        const distinctCountries = Array.from(
          new Set(data.stores.map((store) => store.country || "不明"))
        ).sort();
        setCountries(distinctCountries);
      }
    } catch {
      setError("店舗一覧の読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    void loadStores("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      void loadStores(query, countryFilter);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, countryFilter]);

  const storeGroups = groupStoresByCountry(stores);

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">店舗一覧</h1>
        <p className="mt-2 text-sm text-stone-500">
          登録店舗を名前・地域で検索したり、国で絞り込んだりできます。
        </p>
        <Link
          href="/operator"
          className="mt-3 inline-block text-sm font-bold text-green-800"
        >
          ← 運営者ページに戻る
        </Link>
      </Card>

      <Card className="space-y-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="店舗名・地域で検索"
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
        />

        {countries.length > 1 ? (
          <select
            value={countryFilter}
            onChange={(event) => setCountryFilter(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
          >
            <option value="">すべての国</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        ) : null}
      </Card>

      <Card>
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-[#7B2D3E]">
              {stores.length}
              <span className="ml-1 text-sm font-bold text-stone-500">
                件
              </span>
            </p>

            {isLoading ? (
              <p className="mt-2 text-sm text-stone-500">
                読み込んでいます...
              </p>
            ) : storeGroups.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">
                該当する店舗がありません。
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {storeGroups.map(([country, countryStores]) => (
                  <div key={country}>
                    <p className="text-sm font-bold text-stone-700">
                      {country}({countryStores.length})
                    </p>

                    <ul className="mt-2 space-y-2">
                      {countryStores.map((store) => (
                        <li
                          key={store.id}
                          className="rounded-xl border border-stone-200 px-4 py-3"
                        >
                          <p className="text-sm font-bold text-stone-800">
                            {store.name}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {store.city || "地域未設定"}
                            {store.address ? ` ・ ${store.address}` : ""}
                          </p>
                          <a
                            href={`/s/${store.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block text-xs font-bold text-green-800"
                          >
                            /s/{store.slug} ↗
                          </a>
                          <p className="mt-1 text-xs">
                            {store.isPublished ? (
                              <span className="font-bold text-green-700">
                                公開中
                              </span>
                            ) : (
                              <span className="font-bold text-stone-400">
                                未公開
                              </span>
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
