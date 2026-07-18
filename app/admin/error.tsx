"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Card className="space-y-3">
          <p className="text-sm font-bold text-red-700">
            管理画面を表示できませんでした
          </p>

          <h1 className="text-2xl font-bold text-stone-900">
            ログインし直してください
          </h1>

          <p className="text-sm text-stone-500">
            ログイン中のアカウントで、この店舗を管理する権限が確認できませんでした。店舗が削除された、または権限が変更された可能性があります。一度ログアウトしてから、もう一度ログインしてください。
          </p>

          <Button
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
          >
            ログアウトしてログイン画面へ
          </Button>
        </Card>
      </div>
    </AdminFrame>
  );
}
