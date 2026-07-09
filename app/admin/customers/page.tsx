import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const customers = [
  {
    id: "c001",
    name: "山田 太郎",
    phone: "090-1234-5678",
    email: "taro@example.com",
    visits: 3,
    lastVisit: "2026-07-09",
  },
  {
    id: "c002",
    name: "佐藤 花子",
    phone: "080-2222-3333",
    email: "hanako@example.com",
    visits: 1,
    lastVisit: "2026-07-08",
  },
];

export default function AdminCustomersPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            顧客管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            予約者情報と来店履歴を確認します。
          </p>
        </Card>

        <div className="space-y-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {customer.name}
                </h2>

                <p className="text-sm text-stone-500">
                  {customer.phone}
                </p>

                <p className="text-sm text-stone-500">
                  {customer.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-stone-100 p-3">
                  <p className="text-xl font-bold text-stone-900">
                    {customer.visits}
                  </p>
                  <p className="text-xs text-stone-500">来店回数</p>
                </div>

                <div className="rounded-2xl bg-stone-100 p-3">
                  <p className="text-sm font-bold text-stone-900">
                    {customer.lastVisit}
                  </p>
                  <p className="text-xs text-stone-500">最終来店</p>
                </div>
              </div>

              <Button variant="secondary">
                詳細を見る
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}