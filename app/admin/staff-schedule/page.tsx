import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AdminCalendar from "@/components/admin/AdminCalendar";

export default function StaffSchedulePage() {
  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">店舗管理メインへ</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            スケジュール管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            営業日・営業時間・施術者の出勤状況をまとめて確認できます。マスをタップすると、その日の内容を編集できます。
          </p>
        </Card>

        <AdminCalendar />

        <div className="space-y-3">
          <Link href="/admin/shifts">
            <Button variant="secondary">出勤表管理</Button>
          </Link>

          <Link href="/admin/hours">
            <Button variant="secondary">営業時間管理(曜日ごとの通常設定)</Button>
          </Link>

          <Link href="/admin/holidays">
            <Button variant="secondary">休業日管理</Button>
          </Link>
        </div>
      </div>
    </AdminFrame>
  );
}
