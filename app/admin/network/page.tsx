"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";

type LinkType = "SISTER" | "REGIONAL";
type LinkStatus = "PENDING" | "ACCEPTED" | "DECLINED";

type PartnerStore = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string;
};

type StoreLink = {
  id: string;
  type: LinkType;
  status: LinkStatus;
  isRequester: boolean;
  partner: PartnerStore;
  createdAt: string;
};

const TYPE_LABEL: Record<LinkType, string> = {
  SISTER: "系列店連携",
  REGIONAL: "近隣の店舗と連携しますか？",
};

const TYPE_DESCRIPTION: Record<LinkType, string> = {
  SISTER:
    "姉妹店・系列店どうしで空き状況を共有します。連携しても、お客様の個人情報などが共有されることはありません。",
  REGIONAL:
    "連携しても、お客様の個人情報などが共有されることはありません。あなたのお店が満席のときはお客様に近隣のお店をご案内し、逆に相手のお店が満席のときは、あなたのお店に空きがあればお客様にご案内されます。",
};

export default function AdminNetworkPage() {
  const [links, setLinks] = useState<StoreLink[]>([]);
  const [networkEnabled, setNetworkEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  async function loadLinks() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/store-links");

      if (!response.ok) {
        setError("連携状況の読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as {
        links: StoreLink[];
        storeNetworkEnabled: boolean;
      };
      setLinks(data.links);
      setNetworkEnabled(data.storeNetworkEnabled);
    } catch {
      setError("連携状況の読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    void loadLinks();
  }, []);

  async function handleAccept(id: string) {
    setError("");

    try {
      const response = await fetch(`/api/admin/store-links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      if (!response.ok) {
        setError("承認に失敗しました。");
        return;
      }

      await loadLinks();
    } catch {
      setError("承認に失敗しました。");
    }
  }

  async function handleRemove(id: string) {
    setError("");

    try {
      const response = await fetch(`/api/admin/store-links/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("操作に失敗しました。");
        return;
      }

      setLinks((current) => current.filter((link) => link.id !== id));
    } catch {
      setError("操作に失敗しました。");
    }
  }

  function handleCreated(link: StoreLink) {
    setLinks((current) => [
      link,
      ...current.filter((existing) => existing.id !== link.id),
    ]);
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Card className="space-y-2">
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>
          <h1 className="text-2xl font-bold text-stone-900">店舗間連携</h1>
          <p className="text-sm text-stone-500">
            姉妹店・系列店や、近隣の他店舗と空き状況を共有するための設定です。連携すると、あなたのお店が満席のときにお客様へ他のお店をご案内できます（相手のお店が満席のときも同様に、あなたのお店がご案内されます）。
          </p>
          <Link
            href="/admin"
            className="inline-block text-sm font-bold text-green-800"
          >
            ← 店舗管理トップに戻る
          </Link>
        </Card>

        {!networkEnabled ? (
          <Card>
            <p className="text-sm font-bold text-stone-700">
              この機能は現在、運営者によって無効化されています。
            </p>
            <p className="mt-1 text-xs text-stone-500">
              有効になるまで新しいリクエストの送信はできません。既存の連携があれば下に表示されます。
            </p>
          </Card>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <Card>
            <p className="text-sm text-stone-500">読み込んでいます...</p>
          </Card>
        ) : (
          (["SISTER", "REGIONAL"] as LinkType[]).map((type) => (
            <NetworkTypeSection
              key={type}
              type={type}
              links={links.filter((link) => link.type === type)}
              networkEnabled={networkEnabled}
              onAccept={handleAccept}
              onRemove={handleRemove}
              onCreated={handleCreated}
            />
          ))
        )}
      </div>
    </AdminFrame>
  );
}

function NetworkTypeSection({
  type,
  links,
  networkEnabled,
  onAccept,
  onRemove,
  onCreated,
}: {
  type: LinkType;
  links: StoreLink[];
  networkEnabled: boolean;
  onAccept: (id: string) => void;
  onRemove: (id: string) => void;
  onCreated: (link: StoreLink) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PartnerStore[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestingSlug, setRequestingSlug] = useState<string | null>(null);

  async function search(q: string) {
    setIsSearching(true);

    try {
      const response = await fetch(
        `/api/admin/store-links/search?q=${encodeURIComponent(q)}`
      );

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { stores: PartnerStore[] };
      setResults(data.stores);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    if (!networkEnabled) {
      return;
    }

    const trimmed = query.trim();

    const timer = setTimeout(() => {
      if (trimmed.length < 1) {
        setResults([]);
        return;
      }

      void search(trimmed);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, networkEnabled]);

  async function requestLink(store: PartnerStore) {
    setRequestError("");
    setRequestingSlug(store.slug);

    try {
      const response = await fetch("/api/admin/store-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSlug: store.slug, type }),
      });

      const data = (await response.json().catch(() => null)) as
        | { link?: StoreLink; error?: string }
        | null;

      if (!response.ok || !data?.link) {
        setRequestError(data?.error ?? "リクエストに失敗しました。");
        return;
      }

      onCreated(data.link);
      setQuery("");
      setResults([]);
    } catch {
      setRequestError("リクエストに失敗しました。");
    } finally {
      setRequestingSlug(null);
    }
  }

  const accepted = links.filter((link) => link.status === "ACCEPTED");
  const incoming = links.filter(
    (link) => link.status === "PENDING" && !link.isRequester
  );
  const outgoing = links.filter(
    (link) => link.status === "PENDING" && link.isRequester
  );
  const linkedStoreIds = new Set(
    links.filter((link) => link.status !== "DECLINED").map((link) => link.partner.id)
  );

  return (
    <Card className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-stone-900">
          {TYPE_LABEL[type]}
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          {TYPE_DESCRIPTION[type]}
        </p>
      </div>

      {incoming.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-600">
            連携リクエストが届いています
          </p>
          <ul className="space-y-2">
            {incoming.map((link) => (
              <li
                key={link.id}
                className="rounded-xl border border-green-300 bg-green-50 px-4 py-3"
              >
                <p className="text-sm font-bold text-stone-800">
                  {link.partner.name}
                </p>
                <p className="text-xs text-stone-500">
                  {link.partner.city || link.partner.country}
                </p>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => onAccept(link.id)}
                    className="text-xs font-bold text-green-800"
                  >
                    承認する
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(link.id)}
                    className="text-xs font-bold text-red-700"
                  >
                    却下する
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {outgoing.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-600">
            承認待ちのリクエスト
          </p>
          <ul className="space-y-2">
            {outgoing.map((link) => (
              <li
                key={link.id}
                className="rounded-xl border border-stone-200 px-4 py-3"
              >
                <p className="text-sm font-bold text-stone-800">
                  {link.partner.name}
                </p>
                <p className="text-xs text-stone-500">
                  {link.partner.city || link.partner.country} ・ 相手の承認待ち
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(link.id)}
                  className="mt-2 text-xs font-bold text-stone-500"
                >
                  取り消す
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-bold text-stone-600">
          連携中の店舗{accepted.length > 0 ? `(${accepted.length})` : ""}
        </p>
        {accepted.length === 0 ? (
          <p className="text-xs text-stone-400">
            まだ連携している店舗はありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {accepted.map((link) => (
              <li
                key={link.id}
                className="rounded-xl border border-stone-200 px-4 py-3"
              >
                <p className="text-sm font-bold text-stone-800">
                  {link.partner.name}
                </p>
                <p className="text-xs text-stone-500">
                  {link.partner.city || link.partner.country}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(link.id)}
                  className="mt-2 text-xs font-bold text-red-700"
                >
                  連携を解除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {networkEnabled ? (
        <div className="space-y-2 border-t border-stone-100 pt-3">
          <p className="text-xs font-bold text-stone-600">
            新しく連携をリクエストする
          </p>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="店舗名・地域で検索"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
          />

          {requestError ? (
            <p className="text-xs font-bold text-red-700">{requestError}</p>
          ) : null}

          {isSearching ? (
            <p className="text-xs text-stone-400">検索しています...</p>
          ) : results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((result) => {
                const alreadyLinked = linkedStoreIds.has(result.id);

                return (
                  <li
                    key={result.id}
                    className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        {result.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {result.city || result.country}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={alreadyLinked || requestingSlug === result.slug}
                      onClick={() => requestLink(result)}
                      className="text-xs font-bold text-green-800 disabled:text-stone-300"
                    >
                      {alreadyLinked
                        ? "連携済み"
                        : requestingSlug === result.slug
                          ? "送信中..."
                          : "リクエストする"}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.trim().length > 0 ? (
            <p className="text-xs text-stone-400">
              該当する店舗が見つかりません。
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
