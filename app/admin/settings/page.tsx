"use client";

import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">
            Yoyaku Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            システム設定
          </h1>

          <p className="mt-2 text-stone-500">
            店舗全体の設定を管理します。
          </p>
        </Card>

        <Card className="space-y-4">

          <Link href="/admin/store">
            <Button>店舗情報</Button>
          </Link>

          <Link href="/admin/menu">
            <Button variant="secondary">
              メニュー管理
            </Button>
          </Link>

          <Link href="/admin/staff">
            <Button variant="secondary">
              施術者管理
            </Button>
          </Link>

          <Link href="/admin/shifts">
            <Button variant="secondary">
              出勤表管理
            </Button>
          </Link>

          <Link href="/admin/bookings">
            <Button variant="secondary">
              予約一覧
            </Button>
          </Link>

        </Card>

        <Card>

          <h2 className="text-xl font-bold">
            Version
          </h2>

          <p className="mt-2 text-stone-500">
            Yoyaku Version 1.0
          </p>

        </Card>

      </div>
    </MobileFrame>
  );
}