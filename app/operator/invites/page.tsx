"use client";

import { FormEvent, useEffect, useState } from "react";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Invite = {
  id: string;
  label: string | null;
  url: string;
  usedAt: string | null;
  createdAt: string;
};

const STORAGE_KEY = "yoyaku-operator-password";

export default function OperatorInvitesPage() {
  const [password, setPassword] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (sessionStorage.getItem(STORAGE_KEY) ?? "")
  );
  const [isAuthed, setIsAuthed] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    if (password) {
      void loadInvites(password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInvites(candidatePassword: string) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/operator/invites?password=${encodeURIComponent(candidatePassword)}`
      );

      if (!response.ok) {
        setIsAuthed(false);
        sessionStorage.removeItem(STORAGE_KEY);
        setError("パスワードが正しくありません。");
        return;
      }

      const data = (await response.json()) as { invites: Invite[] };
      setInvites(data.invites);
      setIsAuthed(true);
      sessionStorage.setItem(STORAGE_KEY, candidatePassword);
    } catch {
      setError("読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadInvites(password);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setError("");
    setNewLink("");

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
        return;
      }

      setNewLink(data.invite.url);
      setLabel("");
      setInvites((current) => [data.invite as Invite, ...current]);
    } catch {
      setError("発行に失敗しました。");
    } finally {
      setIsCreating(false);
    }
  }

  if (!isAuthed) {
    return (
      <MobileFrame>
        <div className="space-y-4 pb-8">
          <Card>
            <p className="text-sm font-bold tracking-widest text-green-800">
              Yoyakus
            </p>
            <h1 className="mt-2 text-2xl font-bold text-stone-900">
              招待リンク管理
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              運営者用パスワードを入力してください。
            </p>
          </Card>

          <form onSubmit={handlePasswordSubmit}>
            <Card className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="パスワード"
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />

              {error ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                >
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "確認しています..." : "入る"}
              </Button>
            </Card>
          </form>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-sm font-bold tracking-widest text-green-800">
            Yoyakus
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            招待リンク管理
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            新しい店舗を招待するリンクを発行できます。1つのリンクにつき1店舗、登録に使われると自動的に無効になります。
          </p>
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

            {newLink ? (
              <div className="break-all rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
                {newLink}
              </div>
            ) : null}

            <Button type="submit" disabled={isCreating}>
              {isCreating ? "発行しています..." : "新しい招待リンクを発行"}
            </Button>
          </Card>
        </form>

        <Card>
          <h2 className="text-lg font-bold text-stone-900">発行履歴</h2>

          {isLoading ? (
            <p className="mt-2 text-sm text-stone-500">読み込んでいます...</p>
          ) : invites.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">
              まだ招待リンクがありません。
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {invites.map((invite) => (
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
                  <p className="mt-1 text-xs">
                    {invite.usedAt ? (
                      <span className="font-bold text-stone-400">
                        使用済み
                      </span>
                    ) : (
                      <span className="font-bold text-green-700">未使用</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </MobileFrame>
  );
}
