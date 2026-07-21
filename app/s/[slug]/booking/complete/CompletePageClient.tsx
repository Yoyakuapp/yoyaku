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
