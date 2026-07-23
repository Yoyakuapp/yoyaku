"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import OperatorGate from "@/components/operator/OperatorGate";

type Store = {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string | null;
  address: string | null;
  isActive: boolean;
  isPublished: boolean;
  allowPhoneBooking: boolean;
  allowWhatsappBooking: boolean;
  allowYoyakuBooking: boolean;
  createdAt: string;
};

type Notice = {
  id: string;
  title: string;
  body: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type PlatformSettings = {
  storeNetworkEnabled: boolean;
  trialModeEnabled: boolean;
};

const SYSTEM_GUIDE_URL =
  "https://claude.ai/code/artifact/ec39fa3d-9b49-441a-932d-2439aa58110c";

const REFERENCE_LINKS = [
  {
    name: "Neon",
    url: "https://console.neon.tech",
    note: "データベース(Postgres)の管理・接続文字列の確認。",
  },
  {
    name: "Vercel",
    url: "https://vercel.com/dashboard",
    note: "デプロイ状況の確認、環境変数(パスワードやAPIキー)の設定。",
  },
  {
    name: "GitHub (yoyakuapp/yoyaku)",
    url: "https://github.com/yoyakuapp/yoyaku",
    note: "ソースコードの管理。修正内容はここに反映されます。",
  },
  {
    name: "Stripe",
    url: "https://dashboard.stripe.com",
    note: "決済・入金・返金の管理。",
  },
  {
    name: "Claude Code",
    url: "https://claude.ai/code",
    note: "このサイトの開発・修正をAIに依頼するためのツール。今のやり取りもここで行っています。",
  },
];

export default function OperatorDashboardPage() {
  return (
    <MobileFrame>
      <OperatorGate>
        {(password) => <DashboardPanel password={password} />}
      </OperatorGate>
    </MobileFrame>
  );
}

function DashboardPanel({ password }: { password: string }) {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState("");

  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(true);
  const [noticesError, setNoticesError] = useState("");

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [settingsError, setSettingsError] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [isCreatingNotice, setIsCreatingNotice] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const hasLoadedRef = useRef(false);

  async function loadStores() {
    setIsLoadingStores(true);
    setStoresError("");

    try {
      const response = await fetch(
        `/api/operator/stores?password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        setStoresError("店舗一覧の読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as { stores: Store[] };
      setStores(data.stores);
    } catch {
      setStoresError("店舗一覧の読み込みに失敗しました。");
    } finally {
      setIsLoadingStores(false);
    }
  }

  async function loadNotices() {
    setIsLoadingNotices(true);
    setNoticesError("");

    try {
      const response = await fetch(
        `/api/operator/notices?password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        setNoticesError("注意事項の読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as { notices: Notice[] };
      setNotices(data.notices);
    } catch {
      setNoticesError("注意事項の読み込みに失敗しました。");
    } finally {
      setIsLoadingNotices(false);
    }
  }

  async function loadSettings() {
    setSettingsError("");

    try {
      const response = await fetch(
        `/api/operator/settings?password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        setSettingsError("設定の読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as { settings: PlatformSettings };
      setSettings(data.settings);
    } catch {
      setSettingsError("設定の読み込みに失敗しました。");
    }
  }

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    void loadStores();
    void loadNotices();
    void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleStoreNetwork() {
    if (!settings || isSavingSettings) {
      return;
    }

    setIsSavingSettings(true);
    setSettingsError("");

    try {
      const response = await fetch("/api/operator/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          storeNetworkEnabled: !settings.storeNetworkEnabled,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { settings?: PlatformSettings; error?: string }
        | null;

      if (!response.ok || !data?.settings) {
        setSettingsError(data?.error ?? "設定の変更に失敗しました。");
        return;
      }

      setSettings(data.settings);
    } catch {
      setSettingsError("設定の変更に失敗しました。");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleToggleTrialMode() {
    if (!settings || isSavingSettings) {
      return;
    }

    setIsSavingSettings(true);
    setSettingsError("");

    try {
      const response = await fetch("/api/operator/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          trialModeEnabled: !settings.trialModeEnabled,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { settings?: PlatformSettings; error?: string }
        | null;

      if (!response.ok || !data?.settings) {
        setSettingsError(data?.error ?? "設定の変更に失敗しました。");
        return;
      }

      setSettings(data.settings);
    } catch {
      setSettingsError("設定の変更に失敗しました。");
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleCreateNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreatingNotice) {
      return;
    }

    const trimmedTitle = newTitle.trim();
    const trimmedBody = newBody.trim();

    if (!trimmedTitle || !trimmedBody) {
      setNoticesError("タイトルと本文を入力してください。");
      return;
    }

    setIsCreatingNotice(true);
    setNoticesError("");

    try {
      const response = await fetch("/api/operator/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          title: trimmedTitle,
          body: trimmedBody,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { notice?: Notice; error?: string }
        | null;

      if (!response.ok || !data?.notice) {
        setNoticesError(data?.error ?? "追加に失敗しました。");
        return;
      }

      setNotices((current) => [...current, data.notice as Notice]);
      setNewTitle("");
      setNewBody("");
    } catch {
      setNoticesError("追加に失敗しました。");
    } finally {
      setIsCreatingNotice(false);
    }
  }

  function startEditing(notice: Notice) {
    setEditingId(notice.id);
    setEditTitle(notice.title);
    setEditBody(notice.body);
    setNoticesError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId || isSavingEdit) {
      return;
    }

    const trimmedTitle = editTitle.trim();
    const trimmedBody = editBody.trim();

    if (!trimmedTitle || !trimmedBody) {
      setNoticesError("タイトルと本文を入力してください。");
      return;
    }

    setIsSavingEdit(true);
    setNoticesError("");

    try {
      const response = await fetch(`/api/operator/notices/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          title: trimmedTitle,
          body: trimmedBody,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { notice?: Notice; error?: string }
        | null;

      if (!response.ok || !data?.notice) {
        setNoticesError(data?.error ?? "保存に失敗しました。");
        return;
      }

      const updated = data.notice;
      setNotices((current) =>
        current.map((notice) => (notice.id === updated.id ? updated : notice))
      );
      cancelEditing();
    } catch {
      setNoticesError("保存に失敗しました。");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteNotice(id: string) {
    setNoticesError("");

    try {
      const response = await fetch(
        `/api/operator/notices/${id}?password=${encodeURIComponent(password)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setNoticesError("削除に失敗しました。");
        return;
      }

      setNotices((current) => current.filter((notice) => notice.id !== id));
    } catch {
      setNoticesError("削除に失敗しました。");
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">
          運営者ページ
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Yoyakusプラットフォーム全体の管理・運用のためのページです。
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">システム利用ガイド</h2>
        <p className="text-sm text-stone-500">
          招待リンクの発行、店舗一覧の管理、プラットフォーム全体の設定など、運営者としての操作手順をまとめたガイドです。
        </p>

        <a href={SYSTEM_GUIDE_URL} target="_blank" rel="noreferrer" className="block">
          <Button>
            {settings?.trialModeEnabled
              ? "システム利用ガイド・試用期間中"
              : "システム利用ガイド"}
          </Button>
        </a>

        {settings ? (
          <div className="space-y-3 rounded-xl border border-stone-200 px-4 py-3">
            <p className="text-sm font-bold text-stone-800">
              現在: {settings.trialModeEnabled ? "試用期間中" : "運用開始済み"}
            </p>
            <Button
              variant="secondary"
              onClick={handleToggleTrialMode}
              disabled={isSavingSettings}
            >
              {isSavingSettings
                ? "変更しています..."
                : settings.trialModeEnabled
                  ? "運用開始済みに切り替える"
                  : "試用期間中に戻す"}
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">招待リンク管理</h2>
        <p className="text-sm text-stone-500">
          新しい店舗を招待するリンクを発行できます。
        </p>
        <Link href="/operator/invites" className="block">
          <Button>新しい招待リンク発行</Button>
        </Link>
        <Link href="/operator/invites/manage" className="block">
          <Button variant="secondary">発行済み招待リンク管理</Button>
        </Link>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-stone-900">店舗間連携機能</h2>
        <p className="mt-2 text-sm text-stone-500">
          系列店連携・地域連携(空き状況の共有)を、店舗の管理画面から使えるようにするかどうかの設定です。オフの間は店舗側から新しいリクエストを送れません。
        </p>

        {settingsError ? (
          <div
            role="alert"
            className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {settingsError}
          </div>
        ) : null}

        {settings ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
            <p className="text-sm font-bold text-stone-800">
              {settings.storeNetworkEnabled ? "有効" : "無効"}
            </p>
            <Button
              variant={settings.storeNetworkEnabled ? "secondary" : "primary"}
              onClick={handleToggleStoreNetwork}
              disabled={isSavingSettings}
              className="w-auto px-4 py-2"
            >
              {isSavingSettings
                ? "変更しています..."
                : settings.storeNetworkEnabled
                  ? "無効にする"
                  : "有効にする"}
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500">読み込んでいます...</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-stone-900">登録店舗</h2>

        {isLoadingStores ? (
          <p className="mt-2 text-sm text-stone-500">読み込んでいます...</p>
        ) : storesError ? (
          <div
            role="alert"
            className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {storesError}
          </div>
        ) : (
          <p className="mt-2 text-2xl font-bold text-[#7B2D3E]">
            {stores.length}
            <span className="ml-1 text-sm font-bold text-stone-500">
              店舗
            </span>
          </p>
        )}

        <Link href="/operator/stores" className="mt-3 block">
          <Button variant="secondary">店舗一覧を見る(検索・絞り込み)</Button>
        </Link>

        <Link href="/operator/admin-users" className="mt-3 block">
          <Button variant="secondary">
            所属店舗のないログインアカウントを整理
          </Button>
        </Link>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-stone-900">
          登録店舗への注意事項集
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          法的なアナウンスや利用規約など、登録店舗に伝えるべき事項をまとめておけます。
        </p>

        {noticesError ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {noticesError}
          </div>
        ) : null}

        {isLoadingNotices ? (
          <p className="mt-3 text-sm text-stone-500">読み込んでいます...</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {notices.map((notice) =>
              editingId === notice.id ? (
                <li key={notice.id}>
                  <form
                    onSubmit={handleSaveEdit}
                    className="space-y-2 rounded-xl border border-green-300 px-4 py-3"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900 outline-none focus:border-green-800"
                      required
                    />
                    <textarea
                      value={editBody}
                      onChange={(event) => setEditBody(event.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-green-800"
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isSavingEdit}>
                        {isSavingEdit ? "保存しています..." : "保存"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={cancelEditing}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </li>
              ) : (
                <li
                  key={notice.id}
                  className="rounded-xl border border-stone-200 px-4 py-3"
                >
                  <p className="text-sm font-bold text-stone-800">
                    {notice.title}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-stone-600">
                    {notice.body}
                  </p>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => startEditing(notice)}
                      className="text-xs font-bold text-green-800"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="text-xs font-bold text-red-700"
                    >
                      削除
                    </button>
                  </div>
                </li>
              )
            )}

            {notices.length === 0 ? (
              <p className="text-sm text-stone-500">
                まだ注意事項がありません。
              </p>
            ) : null}
          </ul>
        )}

        <form onSubmit={handleCreateNotice} className="mt-4 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="タイトル(例: キャンセルポリシーについて)"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-900 outline-none transition placeholder:font-normal placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
          />
          <textarea
            value={newBody}
            onChange={(event) => setNewBody(event.target.value)}
            placeholder="本文"
            rows={3}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
          />
          <Button type="submit" disabled={isCreatingNotice}>
            {isCreatingNotice ? "追加しています..." : "注意事項を追加"}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-stone-900">
          開発・運用に必要な情報
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          このサイトを構築・修正する際によく使う外部サービスへのリンクです。
        </p>

        <ul className="mt-3 space-y-3">
          {REFERENCE_LINKS.map((link) => (
            <li
              key={link.name}
              className="rounded-xl border border-stone-200 px-4 py-3"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-green-800"
              >
                {link.name} ↗
              </a>
              <p className="mt-1 text-xs text-stone-500">{link.note}</p>
            </li>
          ))}

          <li className="rounded-xl border border-stone-200 px-4 py-3">
            <p className="text-sm font-bold text-stone-800">VSCode</p>
            <p className="mt-1 text-xs text-stone-500">
              コードエディタ。GitHubからこのリポジトリをローカルに複製(clone)して手元で編集する際に使用します。
            </p>
          </li>
        </ul>
      </Card>
    </div>
  );
}
