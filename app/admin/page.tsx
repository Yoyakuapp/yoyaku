import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LogoutButton from "@/components/admin/LogoutButton";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SYSTEM_GUIDE_URL =
  "https://claude.ai/code/artifact/9ac3db5e-f5c2-4d7f-a4c0-1005941d1e22";

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
  const t = dictionaries[
    isSupportedLocale(store.adminLocale) ? store.adminLocale : "ja"
  ].admin.dashboard;
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

          <h1 className="text-3xl font-bold text-stone-900">{t.pageTitle}</h1>

          <p className="text-sm text-stone-500">{store.name}</p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">
            システム利用ガイド
          </h2>
          <p className="text-sm text-stone-500">
            店舗情報の設定からメニュー登録、予約管理、キャンセル・返金対応まで、この管理画面の使い方をまとめたガイドです。
          </p>
          <a href={SYSTEM_GUIDE_URL} target="_blank" rel="noreferrer" className="block">
            <Button>システム利用ガイドを見る</Button>
          </a>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">
            {t.todayStatusHeading}
          </h2>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Link
              href="/admin/today"
              className="rounded-2xl bg-stone-100 p-3 transition active:scale-[0.98]"
            >
              <p className="text-2xl font-bold text-[#7B2D3E]">
                {todaysBookings.length}
              </p>
              <p className="text-xs font-bold text-stone-600">
                {t.todaysBookingsLabel}
              </p>
            </Link>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-2xl font-bold text-stone-900">
                {availableSlots}
              </p>
              <p className="text-xs text-stone-500">{t.availableSlotsLabel}</p>
            </div>

            <Link
              href="/admin/today"
              className="rounded-2xl bg-stone-100 p-3 transition active:scale-[0.98]"
            >
              <p className="text-2xl font-bold text-stone-900">
                {todaysShifts.length}
              </p>
              <p className="text-xs font-bold text-stone-600">
                {t.workingStaffLabel}
              </p>
            </Link>
          </div>

          <Link
            href="/admin/today"
            className="block rounded-2xl border border-stone-200 px-4 py-2 text-center text-sm font-bold text-stone-700"
          >
            {t.viewTodayCta}
          </Link>
        </Card>

        <div className="space-y-3">
          <Link href="/admin/bookings">
            <Button>{t.bookingsListButton}</Button>
          </Link>

          <Link href="/admin/staff-schedule">
            <Button variant="secondary">{t.scheduleButton}</Button>
          </Link>

          <Link href="/admin/staff">
            <Button variant="secondary">{t.staffButton}</Button>
          </Link>

          <Link href="/admin/menu">
            <Button variant="secondary">{t.menuButton}</Button>
          </Link>

          <Link href="/admin/store">
            <Button variant="secondary">{t.storeButton}</Button>
          </Link>

          <Link href="/admin/sales">
            <Button variant="secondary">{t.salesButton}</Button>
          </Link>

          <Link href="/admin/customers">
            <Button variant="secondary">{t.customersButton}</Button>
          </Link>

          <Link href="/admin/network">
            <Button variant="secondary">{t.networkButton}</Button>
          </Link>

          <LogoutButton />
        </div>
      </div>
    </AdminFrame>
  );
}
