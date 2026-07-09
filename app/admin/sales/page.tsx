import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";

const salesSummary = {
  todaySales: 108000,
  todayBookings: 12,
  depositTotal: 16200,
  averagePrice: 9000,
};

const dailySales = [
  { date: "2026-07-09", sales: 108000, bookings: 12 },
  { date: "2026-07-08", sales: 72000, bookings: 8 },
  { date: "2026-07-07", sales: 94500, bookings: 10 },
  { date: "2026-07-06", sales: 63000, bookings: 7 },
];

export default function AdminSalesPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            売上管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            売上・予約数・予約金を確認します。
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">本日の売上</h2>

          <p className="text-4xl font-bold text-stone-900">
            ¥{salesSummary.todaySales.toLocaleString()}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-xl font-bold text-stone-900">
                {salesSummary.todayBookings}
              </p>
              <p className="text-xs text-stone-500">予約</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-xl font-bold text-stone-900">
                ¥{salesSummary.depositTotal.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500">予約金</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-xl font-bold text-stone-900">
                ¥{salesSummary.averagePrice.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500">平均単価</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {dailySales.map((item) => (
            <Card key={item.date} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">{item.date}</p>
                  <p className="text-sm text-stone-500">
                    {item.bookings}件の予約
                  </p>
                </div>

                <p className="text-xl font-bold text-green-800">
                  ¥{item.sales.toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}