"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type StoreInfo = {
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
};

export default function StoreLandingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStore() {
      const response = await fetch(`/api/public/stores/${slug}`, {
        cache: "no-store",
      });

      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        setError(errorBody?.error ?? "店舗情報を取得できませんでした。");
        return;
      }

      const data = (await response.json()) as StoreInfo;

      setStore(data);
    }

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <MobileFrame>
      <div className="space-y-6 pb-16 pt-10 text-center">
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>

        {error ? (
          <Card>
            <p className="font-bold text-red-700">{error}</p>
          </Card>
        ) : store ? (
          <div className="space-y-4">
            {(() => {
              const galleryUrls =
                store.imageUrls.length > 0
                  ? store.imageUrls
                  : store.imageUrl
                    ? [store.imageUrl]
                    : [];

              return galleryUrls.length > 0 ? (
                <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
                  {galleryUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt={store.name}
                      className="h-52 w-[85%] shrink-0 snap-center rounded-3xl object-cover"
                    />
                  ))}
                </div>
              ) : null;
            })()}

            <h1 className="text-3xl font-bold tracking-wide text-stone-900">
              {store.name}
            </h1>

            {store.description ? (
              <p className="text-sm text-stone-600">{store.description}</p>
            ) : null}

            {store.address || store.phone || store.websiteUrl ? (
              <div className="space-y-1 text-sm text-stone-600">
                {store.address ? <p>{store.address}</p> : null}
                {store.phone ? <p>{store.phone}</p> : null}
                {store.websiteUrl ? (
                  <p>
                    <a
                      href={store.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-green-800"
                    >
                      {store.websiteUrl}
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <Card>
            <p className="text-sm text-stone-500">読み込んでいます...</p>
          </Card>
        )}

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <p className="text-sm font-bold text-stone-700">
              今すぐ予約の方はこちら！
            </p>
            <Link href={`/s/${slug}/booking`}>
              <Button>予約！</Button>
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-stone-700">
              お店の方はこちらからどうぞ！
            </p>
            <Link href="/login">
              <Button variant="secondary">店舗管理</Button>
            </Link>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
