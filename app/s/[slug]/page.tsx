"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PhotoGallery from "@/components/booking/PhotoGallery";

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
      <div className="space-y-6 pb-16 pt-10">
        <p className="text-center text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>

        {error ? (
          <Card>
            <p className="font-bold text-red-700">{error}</p>
          </Card>
        ) : store ? (
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5">
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
                  heightClassName="h-64"
                />
              );
            })()}

            <div className="space-y-4 p-6 text-left">
              <h1 className="text-balance text-[28px] font-bold leading-tight tracking-tight text-stone-900">
                {store.name}
              </h1>

              {store.description ? (
                <p className="text-sm leading-relaxed text-stone-600">
                  {store.description}
                </p>
              ) : null}

              {store.address || store.phone || store.websiteUrl ? (
                <div className="space-y-1.5 border-t border-stone-100 pt-4 text-sm">
                  {store.address ? (
                    <p className="text-stone-600">{store.address}</p>
                  ) : null}
                  {store.phone ? (
                    <a
                      href={`tel:${store.phone}`}
                      className="block text-stone-600 underline decoration-stone-300 underline-offset-2 transition active:opacity-70"
                    >
                      {store.phone}
                    </a>
                  ) : null}
                  {store.websiteUrl ? (
                    <a
                      href={store.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block font-bold text-green-800"
                    >
                      {store.websiteUrl}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <Card>
            <p className="text-sm text-stone-500">読み込んでいます...</p>
          </Card>
        )}

        <div className="space-y-6 pt-4 text-center">
          <div className="space-y-2">
            <p className="text-sm font-bold text-stone-700">
              今すぐ予約の方はこちら！
            </p>
            <Link href={`/s/${slug}/booking`}>
              <Button>予約！</Button>
            </Link>
          </div>

          <div className="flex justify-end">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-full border border-green-800 px-4 py-2 text-sm font-bold text-green-800 transition active:scale-[0.98]"
            >
              お店の方はこちら
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
