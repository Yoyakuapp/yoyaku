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
          <Card className="space-y-3 text-left">
            {store.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.imageUrl}
                alt={store.name}
                className="h-40 w-full rounded-2xl object-cover"
              />
            ) : null}

            <h1 className="text-2xl font-bold text-stone-900">
              {store.name}
            </h1>

            {store.description ? (
              <p className="text-sm text-stone-600">{store.description}</p>
            ) : null}
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-stone-500">読み込んでいます...</p>
          </Card>
        )}

        <div className="space-y-3 pt-4">
          <Link href={`/s/${slug}/booking`}>
            <Button>予約！</Button>
          </Link>

          <Link href="/login">
            <Button variant="secondary">お店の管理</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
