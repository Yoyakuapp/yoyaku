"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

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

export default function AdminNetworkPage() {
  const { dictionary } = useLocale();
  const t = dictionary.admin.network;

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
        setError(t.loadError);
        return;
      }

      const data = (await response.json()) as {
        links: StoreLink[];
        storeNetworkEnabled: boolean;
      };
      setLinks(data.links);
      setNetworkEnabled(data.storeNetworkEnabled);
    } catch {
      setError(t.loadError);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setError(t.approveError);
        return;
      }

      await loadLinks();
    } catch {
      setError(t.approveError);
    }
  }

  async function handleRemove(id: string) {
    setError("");

    try {
      const response = await fetch(`/api/admin/store-links/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError(t.removeError);
        return;
      }

      setLinks((current) => current.filter((link) => link.id !== id));
    } catch {
      setError(t.removeError);
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
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>
          <h1 className="text-2xl font-bold text-stone-900">{t.heading}</h1>
          <p className="text-sm text-stone-500">{t.description}</p>
          <Link href="/admin" className="block">
            <Button variant="secondary">{dictionary.admin.common.backToMain}</Button>
          </Link>
        </Card>

        {!networkEnabled ? (
          <Card>
            <p className="text-sm font-bold text-stone-700">
              {t.disabledNoticeTitle}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {t.disabledNoticeBody}
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
            <p className="text-sm text-stone-500">{t.loading}</p>
          </Card>
        ) : (
          (["SISTER", "REGIONAL"] as LinkType[]).map((type) => (
            <NetworkTypeSection
              key={type}
              type={type}
              t={t}
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
  t,
  links,
  networkEnabled,
  onAccept,
  onRemove,
  onCreated,
}: {
  type: LinkType;
  t: Dictionary["admin"]["network"];
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
        setRequestError(data?.error ?? t.requestError);
        return;
      }

      onCreated(data.link);
      setQuery("");
      setResults([]);
    } catch {
      setRequestError(t.requestError);
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
          {t.typeLabels[type]}
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          {t.typeDescriptions[type]}
        </p>
      </div>

      {incoming.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-stone-600">
            {t.incomingHeading}
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
                    {t.approveButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(link.id)}
                    className="text-xs font-bold text-red-700"
                  >
                    {t.rejectButton}
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
            {t.outgoingHeading}
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
                  {link.partner.city || link.partner.country} {t.pendingApprovalSuffix}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(link.id)}
                  className="mt-2 text-xs font-bold text-stone-500"
                >
                  {t.cancelRequestButton}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-bold text-stone-600">
          {t.connectedHeading(accepted.length)}
        </p>
        {accepted.length === 0 ? (
          <p className="text-xs text-stone-400">{t.connectedEmpty}</p>
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
                  {t.disconnectButton}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {networkEnabled ? (
        <div className="space-y-2 border-t border-stone-100 pt-3">
          <p className="text-xs font-bold text-stone-600">
            {t.newRequestHeading}
          </p>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
          />

          {requestError ? (
            <p className="text-xs font-bold text-red-700">{requestError}</p>
          ) : null}

          {isSearching ? (
            <p className="text-xs text-stone-400">{t.searching}</p>
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
                        ? t.alreadyLinked
                        : requestingSlug === result.slug
                          ? t.sending
                          : t.requestButton}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query.trim().length > 0 ? (
            <p className="text-xs text-stone-400">{t.noResults}</p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

