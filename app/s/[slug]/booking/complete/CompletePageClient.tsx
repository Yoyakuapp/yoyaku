"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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
      <div className="space-y-4 pb-8">
        <Card className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-800 text-4xl text-white">
            ✓
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

          <div className="border-t border-stone-200 pt-3">
            <p className="text-sm text-stone-500">予約番号</p>
            <p className="text-xl font-bold text-stone-900">{bookingNo}</p>
          </div>

          <div>
            <p className="text-sm text-stone-500">店舗</p>
            <p className="font-bold text-stone-900">{storeName}</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">当日のご案内</h2>

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
          Powered by <span className="font-bold text-stone-800">Yoyaku</span>
        </p>
      </div>
    </MobileFrame>
  );
}
