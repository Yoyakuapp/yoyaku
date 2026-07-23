"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export default function InvitesManagePage() {
  return (
    <MobileFrame>
      <OperatorGate>
        {(password) => <ManagePanel password={password} />}
      </OperatorGate>
    </MobileFrame>
  );
}

function ManagePanel({ password }: { password: string }) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedInviteId, setCopiedInviteId] = useState("");
  const hasLoadedRef = useRef(false);

  async function loadInvites() {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/operator/invites?password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        setError("読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as { invites: Invite[] };
      setInvites(data.invites);
    } catch {
      setError("読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    void loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCopyInvite(invite: Invite) {
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopiedInviteId(invite.id);
      setTimeout(() => {
        setCopiedInviteId((current) => (current === invite.id ? "" : current));
      }, 2000);
    } catch {
      setError("コピーに失敗しました。リンクを長押しして手動でコピーしてください。");
    }
  }

  const pending = invites.filter((invite) => !invite.usedAt);
  const used = invites.filter((invite) => invite.usedAt);

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          発行済み招待リンク管理
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          発行したリンクの記録です。「未使用」はまだ登録が完了していないお店で、リンクを再送したいときはコピーボタンから送り直せます。「使用済み」はすでに登録が完了しています。
        </p>
        <Link
          href="/operator/invites"
          className="mt-3 inline-block text-sm font-bold text-green-800"
        >
          ← 新しい招待リンクを発行する
        </Link>
      </Card>

      <Card>
        {error ? (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-stone-500">読み込んでいます...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-stone-500">
            まだ招待リンクがありません。
          </p>
        ) : (
          <>
            {pending.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-green-700">
                  未使用(送信待ち)
                </p>

                <ul className="mt-2 space-y-3">
                  {pending.map((invite) => (
                    <li
                      key={invite.id}
                      className="rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                    >
                      <p className="text-sm font-bold text-stone-800">
                        {invite.label || "(メモなし)"}
                      </p>
                      <p className="mt-1 break-all text-xs text-stone-500">
                        {invite.url}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {formatDate(invite.createdAt)}発行
                      </p>

                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleCopyInvite(invite)}
                        >
                          {copiedInviteId === invite.id
                            ? "コピーしました"
                            : "招待リンクをコピー"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {used.length > 0 ? (
              <div className={pending.length > 0 ? "mt-4" : ""}>
                <p className="text-xs font-bold text-stone-500">使用済み</p>

                <ul className="mt-2 space-y-3">
                  {used.map((invite) => (
                    <li
                      key={invite.id}
                      className="rounded-xl border border-stone-200 px-4 py-3"
                    >
                      <p className="text-sm font-bold text-stone-800">
                        {invite.label || "(メモなし)"}
                      </p>
                      <p className="mt-1 break-all text-xs text-stone-500">
                        {invite.url}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {formatDate(invite.createdAt)}発行・使用済み
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </Card>

      <Link href="/operator" className="block">
        <Button variant="secondary">← 運営者ページに戻る</Button>
      </Link>
    </div>
  );
}
