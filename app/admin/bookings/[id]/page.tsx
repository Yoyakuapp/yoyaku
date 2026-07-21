import Link from "next/link";
import { notFound } from "next/navigation";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import BookingRescheduleForm from "./BookingRescheduleForm";
import BookingStatusActions from "./BookingStatusActions";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";

const statusLabels = {
  PENDING: "保留",
  CONFIRMED: "確定",
  CANCELLED: "キャンセル",
  COMPLETED: "完了",
} as const;

export const dynamic = "force-dynamic";

function dateToUtcDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateToUtcTimeValue(date: Date) {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes()
  ).padStart(2, "0")}`;
}

type BookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const { store } = await getStoreForAdminSession();

  const booking = await prisma.booking.findUnique({
    where: {
      id,
      storeId: store.id,
    },
  });

  const staff = await prisma.staff.findMany({
    where: {
      storeId: store.id,
      active: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      name: true,
    },
  });

  if (!booking) {
    notFound();
  }

  const date = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(booking.date);

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link
          href="/admin/bookings"
          className="text-sm font-bold text-stone-500"
        >
          ← 予約一覧
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            予約詳細
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            {booking.bookingNo}
          </p>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-sm text-stone-500">状態</p>
            <p className="mt-1 text-xl font-bold text-stone-900">
              {statusLabels[booking.status]}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">予約日時</p>
            <p className="mt-1 font-bold text-stone-900">{date}</p>
          </div>

          <div>
            <p className="text-sm text-stone-500">お客様名</p>
            <p className="mt-1 font-bold text-stone-900">
              {booking.customer}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">電話番号</p>
            <p className="mt-1 font-bold text-stone-900">
              {booking.phone}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">メールアドレス</p>
            <p className="mt-1 break-all font-bold text-stone-900">
              {booking.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">施術内容</p>
            <p className="mt-1 font-bold text-stone-900">
              {booking.menu}・{booking.duration}分・{booking.people}人
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">担当</p>
            <p className="mt-1 font-bold text-stone-900">
              {booking.staff}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">施術料金</p>
            <p className="mt-1 font-bold text-stone-900">
              ¥{booking.amount.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">予約金</p>
            <p className="mt-1 font-bold text-stone-900">
              ¥{booking.deposit.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">ご要望・メモ</p>
            <p className="mt-1 whitespace-pre-wrap text-stone-900">
              {booking.memo || "なし"}
            </p>
          </div>
        </Card>

        <BookingRescheduleForm
          bookingId={booking.id}
          initialDate={dateToUtcDateValue(booking.date)}
          initialTime={dateToUtcTimeValue(booking.date)}
          initialStaff={booking.staff}
          people={booking.people}
          staffOptions={staff.map((person) => person.name)}
          canReschedule={
            booking.status === "PENDING" || booking.status === "CONFIRMED"
          }
        />

        <BookingStatusActions
          bookingId={booking.id}
          currentStatus={booking.status}
          hasPayment={Boolean(booking.stripePaymentIntentId) && !booking.refundedAt}
        />
      </div>
    </AdminFrame>
  );
}
