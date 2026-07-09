import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const bookings = [
  {
    id: "YOYAKU-0001",
    customer: "山田 太郎",
    time: "10:30",
    duration: "60分",
    people: "1人",
    staff: "AIKO",
    status: "確定",
  },
  {
    id: "YOYAKU-0002",
    customer: "佐藤 花子",
    time: "14:00",
    duration: "90分",
    people: "2人",
    staff: "EMI + YUNA",
    status: "確定",
  },
];

export default function AdminBookingsPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            予約一覧
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            本日の予約を確認できます。
          </p>
        </Card>

        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">{booking.id}</p>
                  <h2 className="text-2xl font-bold text-stone-900">
                    {booking.time}
                  </h2>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                  {booking.status}
                </span>
              </div>

              <div className="border-t border-stone-200 pt-3 text-sm text-stone-600">
                <p>お客様：{booking.customer}</p>
                <p>内容：{booking.duration}・{booking.people}</p>
                <p>担当：{booking.staff}</p>
              </div>

              <Button variant="secondary">詳細を見る</Button>
            </Card>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}