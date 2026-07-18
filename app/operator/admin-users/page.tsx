"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import OperatorGate from "@/components/operator/OperatorGate";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export default function OperatorAdminUsersPage() {
  return (
    <MobileFrame>
      <OperatorGate>
        {(password) => <AdminUsersPanel password={password} />}
      </OperatorGate>
    </MobileFrame>
  );
}

function AdminUsersPanel({ password }: { password: string }) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  async function loadAdminUsers() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/operator/admin-users?password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        setError("読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as { adminUsers: AdminUser[] };
      setAdminUsers(data.adminUsers);
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
    void loadAdminUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(adminUser: AdminUser) {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      `「${adminUser.email}」のログインアカウントを削除します。この操作は取り消せません。よろしいですか？`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingId(adminUser.id);

    try {
      const response = await fetch(
        `/api/operator/admin-users/${adminUser.id}?password=${encodeURIComponent(password)}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "削除に失敗しました。");
        return;
      }

      setAdminUsers((current) =>
        current.filter((item) => item.id !== adminUser.id)
      );
    } catch {
      setError("削除に失敗しました。");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          所属店舗のないログインアカウント
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          店舗を削除すると、そのログインアカウント(メールアドレス)は自動的に削除されるようになりました。ここに表示されるのは、それより前に店舗が削除されて残ってしまった古いアカウントです。削除すると、同じメールアドレスで再登録できるようになります。
        </p>
        <Link
          href="/operator"
          className="mt-3 inline-block text-sm font-bold text-green-800"
        >
          ← 運営者ページに戻る
        </Link>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
        >
          {error}
        </div>
      ) : null}

      <Card>
        {isLoading ? (
          <p className="text-sm text-stone-500">読み込んでいます...</p>
        ) : adminUsers.length === 0 ? (
          <p className="text-sm text-stone-500">
            所属店舗のないアカウントはありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {adminUsers.map((adminUser) => (
              <li
                key={adminUser.id}
                className="rounded-xl border border-stone-200 px-4 py-3"
              >
                <p className="text-sm font-bold text-stone-800">
                  {adminUser.email}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {adminUser.name}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(adminUser)}
                  disabled={deletingId === adminUser.id}
                  className="mt-2 text-xs font-bold text-red-700 disabled:text-stone-300"
                >
                  {deletingId === adminUser.id
                    ? "削除しています..."
                    : "このアカウントを削除"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
