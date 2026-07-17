import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";

const summary = [
  {
    label: "今月の予約",
    value: "248",
  },
  {
    label: "売上",
    value: "¥2,232,000",
  },
  {
    label: "平均単価",
    value: "¥9,000",
  },
];

const popularMenus = [
  {
    name: "60分",
    count: 124,
  },
  {
    name: "90分",
    count: 72,
  },
  {
    name: "120分",
    count: 38,
  },
  {
    name: "30分",
    count: 14,
  },
];

const staffRanking = [
  {
    name: "AIKO",
    bookings: 92,
    sales: 828000,
  },
  {
    name: "EMI",
    bookings: 84,
    sales: 756000,
  },
  {
    name: "YUNA",
    bookings: 72,
    sales: 648000,
  },
];

export default function AdminAnalyticsPage() {
  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            分析
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            予約・売上・人気メニューを確認します。
          </p>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          {summary.map((item) => (
            <Card key={item.label} className="text-center">
              <p className="text-xl font-bold text-stone-900">
                {item.value}
              </p>

              <p className="mt-1 text-xs text-stone-500">
                {item.label}
              </p>
            </Card>
          ))}
        </div>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">
            人気メニュー
          </h2>

          {popularMenus.map((menu) => (
            <div
              key={menu.name}
              className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-stone-900">{menu.name}</p>
                <p className="text-sm font-bold text-green-800">
                  {menu.count}件
                </p>
              </div>

              <div className="mt-2 h-3 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-green-800"
                  style={{ width: `${Math.min(menu.count, 124) / 124 * 100}%` }}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">
            施術者別実績
          </h2>

          {staffRanking.map((staff) => (
            <div
              key={staff.name}
              className="border-t border-stone-100 pt-3 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">{staff.name}</p>
                  <p className="text-sm text-stone-500">
                    {staff.bookings}件
                  </p>
                </div>

                <p className="font-bold text-green-800">
                  ¥{staff.sales.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AdminFrame>
  );
}