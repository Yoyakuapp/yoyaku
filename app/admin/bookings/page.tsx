import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";

const statusLabels = {
  PENDING: "保留",
  CONFIRMED: "確定",
  CANCELLED: "キャンセル",
  COMPLETED: "完了",
} as const;

const statusClasses = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-stone-200 text-stone-700",
} as const;

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { store } = await getStoreForAdminSession();

  const bookings = await prisma.booking.findMany({
    where: {
      storeId: store.id,
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <AdminFrame>
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
            保存されている予約を確認できます。
          </p>
        </Card>

        {bookings.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              予約はまだありません。
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const date = new Intl.DateTimeFormat("ja-JP", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Berlin",
              }).format(booking.date);

              return (
                <Card key={booking.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-stone-500">
                        {booking.bookingNo}
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-stone-900">
                        {date}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusClasses[booking.status]
                      }`}
                    >
                      {statusLabels[booking.status]}
                    </span>
                  </div>

                  <div className="border-t border-stone-200 pt-3 text-sm text-stone-600">
                    <p>お客様：{booking.customer}</p>
                    <p>
                      内容：{booking.duration}分・{booking.people}人
                    </p>
                    <p>担当：{booking.staff}</p>
                    <p>電話：{booking.phone}</p>
                  </div>

                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="block rounded-2xl bg-stone-100 px-4 py-3 text-center text-sm font-bold text-stone-800"
                  >
                    詳細を見る
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminFrame>
  );
}
