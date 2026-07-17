import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LogoutButton from "@/components/admin/LogoutButton";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export default async function AdminPage() {
  const { store } = await getStoreForAdminSession();
  const todayKey = formatDateKey(new Date(), store.timezone);

  const [bookings, shifts] = await Promise.all([
    prisma.booking.findMany({
      where: {
        storeId: store.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        date: true,
        duration: true,
      },
    }),
    prisma.shift.findMany({
      where: {
        isWorking: true,
        staff: {
          storeId: store.id,
          active: true,
        },
      },
      select: {
        date: true,
        startTime: true,
        endTime: true,
      },
    }),
  ]);

  const todaysBookings = bookings.filter(
    (booking) => formatDateKey(booking.date, store.timezone) === todayKey
  );

  const todaysShifts = shifts.filter(
    (shift) => formatDateKey(shift.date, store.timezone) === todayKey
  );

  function shiftMinutes(startTime: string, endTime: string) {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    return endHour * 60 + endMinute - (startHour * 60 + startMinute);
  }

  const totalSlotMinutes = todaysShifts.reduce(
    (total, shift) => total + shiftMinutes(shift.startTime, shift.endTime),
    0
  );
  const bookedMinutes = todaysBookings.reduce(
    (total, booking) => total + booking.duration,
    0
  );
  const availableSlots = Math.max(
    0,
    Math.floor((totalSlotMinutes - bookedMinutes) / 30)
  );

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Card className="space-y-3">
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="text-3xl font-bold text-stone-900">店舗管理</h1>

          <p className="text-sm text-stone-500">{store.name}</p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">今日の状況</h2>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-2xl font-bold text-stone-900">
                {todaysBookings.length}
              </p>
              <p className="text-xs text-stone-500">予約</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-2xl font-bold text-stone-900">
                {availableSlots}
              </p>
              <p className="text-xs text-stone-500">空き枠</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-2xl font-bold text-stone-900">
                {todaysShifts.length}
              </p>
              <p className="text-xs text-stone-500">出勤</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Link href="/admin/bookings">
            <Button>予約一覧</Button>
          </Link>

          <Link href="/admin/sales">
            <Button variant="secondary">売上管理</Button>
          </Link>

          <Link href="/admin/customers">
            <Button variant="secondary">顧客管理</Button>
          </Link>

          <Link href="/admin/basic-info">
            <Button variant="secondary">基本情報管理</Button>
          </Link>

          <Link href="/admin/staff-schedule">
            <Button variant="secondary">施術者＆スケジュール管理</Button>
          </Link>

          <LogoutButton />
        </div>
      </div>
    </AdminFrame>
  );
}
