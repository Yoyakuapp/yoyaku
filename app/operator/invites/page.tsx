"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import OperatorGate from "@/components/operator/OperatorGate";

type Invite = {
  id: string;
  label: string | null;
  url: string;
  usedAt: string | null;
  createdAt: string;
};

export default function OperatorInvitesPage() {
  return (
    <MobileFrame>
      <OperatorGate>
        {(password) => <InvitesPanel password={password} />}
      </OperatorGate>
    </MobileFrame>
  );
}

function InvitesPanel({ password }: { password: string }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/operator/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, label }),
      });

      const data = (await response.json().catch(() => null)) as
        | { invite?: Invite; error?: string }
        | null;

      if (!response.ok || !data?.invite) {
        setError(data?.error ?? "発行に失敗しました。");
        setIsCreating(false);
        return;
      }

      const query = new URLSearchParams({ url: data.invite.url });

      if (label) {
        query.set("label", label);
      }

      router.push(`/operator/invites/created?${query.toString()}`);
    } catch {
      setError("発行に失敗しました。");
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          新しい招待リンクを発行
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          新しい店舗を招待するリンクを発行できます。1つのリンクにつき1店舗、登録に使われると自動的に無効になります。
        </p>
        <Link
          href="/operator"
          className="mt-3 inline-block text-sm font-bold text-green-800"
        >
          ← 運営者ページに戻る
        </Link>
      </Card>

      <form onSubmit={handleCreate}>
        <Card className="space-y-4">
          <div>
            <label
              htmlFor="invite-label"
              className="block text-sm font-bold text-stone-800"
            >
              招待先のメモ(任意)
            </label>

            <input
              id="invite-label"
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="例: さくらマッサージ"
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={isCreating}>
            {isCreating ? "発行しています..." : "新しい招待リンクを発行"}
          </Button>
        </Card>
      </form>

      <Link href="/operator/invites/manage" className="block">
        <Button variant="secondary">発行済み招待リンク管理を見る</Button>
      </Link>
    </div>
  );
}
