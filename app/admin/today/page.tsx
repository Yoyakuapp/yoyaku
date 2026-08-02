import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/intlLocale";

export const dynamic = "force-dynamic";

const statusClasses = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-stone-200 text-stone-700",
} as const;

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

function formatClockTime(date: Date, timeZone: string, intlLocale: string) {
  return new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatTodayLabel(timeZone: string, intlLocale: string) {
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone,
  }).format(new Date());
}

export default async function AdminTodayPage() {
  const { store } = await getStoreForAdminSession();
  const locale = isSupportedLocale(store.adminLocale) ? store.adminLocale : "ja";
  const t = dictionaries[locale].admin.today;
  const common = dictionaries[locale].admin.common;
  const intlLocale = INTL_LOCALE_TAGS[locale];
  const todayKey = formatDateKey(new Date(), store.timezone);

  const [bookings, shifts] = await Promise.all([
    prisma.booking.findMany({
      where: {
        storeId: store.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      orderBy: {
        date: "asc",
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
      include: {
        staff: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    }),
  ]);

  const todaysBookings = bookings.filter(
    (booking) => formatDateKey(booking.date, store.timezone) === todayKey
  );

  const todaysShifts = shifts.filter(
    (shift) => formatDateKey(shift.date, store.timezone) === todayKey
  );

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">{common.backToMain}</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            {formatTodayLabel(store.timezone, intlLocale)}
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-bold text-stone-900">{t.workingTodayHeading}</h2>

          {todaysShifts.length === 0 ? (
            <p className="text-sm text-stone-500">{t.noStaffToday}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {todaysShifts.map((shift) => (
                <span
                  key={shift.id}
                  className="rounded-full bg-stone-100 px-3 py-1.5 text-sm"
                >
                  <span className="font-bold text-[#7B2D3E]">
                    {shift.staff.name}
                  </span>
                  <span className="ml-1 text-stone-600">
                    {shift.startTime}〜{shift.endTime}
                  </span>
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-0 overflow-hidden">
          <h2 className="px-4 pt-4 text-lg font-bold text-stone-900">
            {t.bookingsListHeading(todaysBookings.length)}
          </h2>

          {todaysBookings.length === 0 ? (
            <p className="px-4 pb-4 text-sm text-stone-500">{t.noBookingsToday}</p>
          ) : (
            <div className="overflow-x-auto pb-1">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-bold text-stone-600">
                      {t.tableHeaderTime}
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-bold text-stone-600">
                      {t.tableHeaderStaff}
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-bold text-stone-600">
                      {t.tableHeaderMenu}
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-bold text-stone-600">
                      {t.tableHeaderCustomer}
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-bold text-stone-600">
                      {t.tableHeaderStatus}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {todaysBookings.map((booking) => {
                    const endTime = addMinutes(booking.date, booking.duration);

                    return (
                      <tr key={booking.id}>
                        <td className="border-b border-stone-100 px-3 py-3 align-top">
                          <p className="font-bold text-stone-900">
                            {formatClockTime(booking.date, store.timezone, intlLocale)}
                            〜{formatClockTime(endTime, store.timezone, intlLocale)}
                          </p>
                          <p className="text-xs text-stone-500">
                            {t.durationPeopleSuffix(booking.duration, booking.people)}
                          </p>
                        </td>

                        <td className="border-b border-stone-100 px-3 py-3 align-top font-bold text-[#7B2D3E]">
                          {booking.staff}
                        </td>

                        <td className="border-b border-stone-100 px-3 py-3 align-top text-stone-700">
                          {booking.menu}
                        </td>

                        <td className="border-b border-stone-100 px-3 py-3 align-top text-stone-700">
                          {booking.customer}
                        </td>

                        <td className="border-b border-stone-100 px-3 py-3 align-top">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-bold ${
                              statusClasses[booking.status]
                            }`}
                          >
                            {common.bookingStatusLabels[booking.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminFrame>
  );
}

