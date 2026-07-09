import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">

        <Link
          href="/admin"
          className="text-sm font-bold text-stone-500"
        >
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">
            Yoyaku Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            ダッシュボード
          </h1>
        </Card>

        <div className="grid grid-cols-2 gap-3">

          <Card className="text-center">
            <p className="text-4xl font-bold">12</p>
            <p className="text-sm text-stone-500">
              本日の予約
            </p>
          </Card>

          <Card className="text-center">
            <p className="text-4xl font-bold">18</p>
            <p className="text-sm text-stone-500">
              空き枠
            </p>
          </Card>

          <Card className="text-center">
            <p className="text-4xl font-bold">
              ¥108,000
            </p>
            <p className="text-sm text-stone-500">
              本日の売上
            </p>
          </Card>

          <Card className="text-center">
            <p className="text-4xl font-bold">
              4.8
            </p>
            <p className="text-sm text-stone-500">
              Google評価
            </p>
          </Card>

        </div>

        <Card>

          <h2 className="font-bold text-xl">
            今日の予約
          </h2>

          <div className="mt-3 space-y-2">

            <div className="flex justify-between">
              <span>10:00</span>
              <span>山田 太郎</span>
            </div>

            <div className="flex justify-between">
              <span>11:30</span>
              <span>佐藤 花子</span>
            </div>

            <div className="flex justify-between">
              <span>13:00</span>
              <span>John Smith</span>
            </div>

          </div>

        </Card>

        <Link href="/admin/bookings">
          <Button>
            予約一覧を見る
          </Button>
        </Link>

      </div>
    </MobileFrame>
  );
}