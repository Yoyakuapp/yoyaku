import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Card className="space-y-3">
          <p className="text-sm font-bold text-green-800">
            Yoyaku Admin
          </p>

          <h1 className="text-3xl font-bold text-stone-900">
            店舗管理
          </h1>

          <p className="text-sm text-stone-500">
            Sakura Thai Massage
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">
            今日の状況
          </h2>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-2xl font-bold text-stone-900">12</p>
              <p className="text-xs text-stone-500">予約</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-2xl font-bold text-stone-900">18</p>
              <p className="text-xs text-stone-500">空き枠</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-2xl font-bold text-stone-900">3</p>
              <p className="text-xs text-stone-500">出勤</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">

          <Link href="/admin/dashboard">
  <Button>
    ダッシュボード
  </Button>
</Link>

          <Link href="/admin/bookings">
            <Button>
              予約一覧
            </Button>
          </Link>

          <Link href="/admin/sales">
            <Button variant="secondary">
              売上管理
            </Button>
          </Link>

          <Link href="/admin/customers">
            <Button variant="secondary">
              顧客管理
            </Button>
          </Link>

          <Link href="/admin/store">
            <Button variant="secondary">
              店舗情報
            </Button>
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

          <Link href="/admin/hours">
            <Button variant="secondary">
              営業時間管理
            </Button>
          </Link>

          <Link href="/admin/holidays">
            <Button variant="secondary">
              休業日管理
            </Button>
          </Link>

          <Link href="/admin/settings">
            <Button variant="secondary">
              システム設定
            </Button>
          </Link>

          <LogoutButton />
        </div>
      </div>
    </MobileFrame>
  );
}
