"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import OperatorGate from "@/components/operator/OperatorGate";

export default function InviteCreatedPage() {
  return (
    <MobileFrame>
      <OperatorGate>
        {() => (
          <Suspense fallback={null}>
            <InviteCreatedPanel />
          </Suspense>
        )}
      </OperatorGate>
    </MobileFrame>
  );
}

function InviteCreatedPanel() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const label = searchParams.get("label") ?? "";
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch {
      // リンクは画面に表示済みなので、手動でコピーしてもらう
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          招待リンクを発行しました
        </h1>
      </Card>

      {url ? (
        <Card className="space-y-3 border-2 border-green-200 bg-green-50">
          <p className="text-sm font-bold text-green-800">
            {label ? `「${label}」` : "この店舗"}の招待リンクは以下です。
          </p>

          <p className="break-all rounded-xl bg-white px-4 py-3 text-sm text-stone-700">
            {url}
          </p>

          <p className="text-xs text-stone-500">
            下のボタンでコピーして、メールやメッセージで招待先に送ってください。
          </p>

          <Button type="button" onClick={handleCopy}>
            {isCopied ? "コピーしました" : "招待リンクをコピー"}
          </Button>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-stone-500">
            表示できる招待リンクがありません。
          </p>
        </Card>
      )}

      <Link href="/operator/invites">
        <Button variant="secondary">招待リンク管理に戻る</Button>
      </Link>
    </div>
  );
}
