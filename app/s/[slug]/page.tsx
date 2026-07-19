"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";
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
      <div className="space-y-6 pb-32 pt-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold tracking-widest text-mustard-500">
            Yoyakus
          </p>

          <Link
            href="/login"
            className="text-xs font-bold text-stone-400 transition active:opacity-70"
          >
            お店の方はこちら
          </Link>
        </div>

        {error ? (
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <p className="font-bold text-red-700">{error}</p>
          </div>
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

            <div className="space-y-5 p-6 text-left">
              <h1 className="text-balance text-[28px] font-bold leading-tight tracking-tight text-stone-900">
                {store.name}
              </h1>

              {store.description ? (
                <p className="text-[15px] leading-relaxed text-stone-600">
                  {store.description}
                </p>
              ) : null}

              {store.address || store.phone || store.websiteUrl ? (
                <div className="space-y-3 border-t border-stone-100 pt-5 text-sm">
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
                      className="flex items-center gap-2.5 font-bold text-green-800"
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
          <div className="space-y-4 overflow-hidden rounded-3xl bg-white p-6 shadow-md">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-stone-100 via-stone-100/95 to-transparent pb-6 pt-8">
        <div className="w-full max-w-[398px] px-4">
          <Link href={`/s/${slug}/booking`}>
            <Button size="lg">今すぐ予約する</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
