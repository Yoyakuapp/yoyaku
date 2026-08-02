import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isSupportedLocale } from "@/lib/i18n/locales";

type DailySales = {
  date: string;
  paid: number;
  refunded: number;
  net: number;
  bookings: number;
};

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

export default async function AdminSalesPage() {
  const { store } = await getStoreForAdminSession();
  const locale = isSupportedLocale(store.adminLocale) ? store.adminLocale : "ja";
  const t = dictionaries[locale].admin.sales;
  const common = dictionaries[locale].admin.common;

  const bookings = await prisma.booking.findMany({
    where: {
      storeId: store.id,
      stripePaymentIntentId: {
        not: null,
      },
    },
    select: {
      date: true,
      deposit: true,
      refundedAt: true,
      refundedAmount: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const dailySalesMap = new Map<string, DailySales>();

  for (const booking of bookings) {
    const date = formatDateKey(booking.date, store.timezone);
    const existingDay =
      dailySalesMap.get(date) ??
      ({
        date,
        paid: 0,
        refunded: 0,
        net: 0,
        bookings: 0,
      } satisfies DailySales);

    existingDay.paid += booking.deposit;
    existingDay.refunded += booking.refundedAt
      ? (booking.refundedAmount ?? booking.deposit)
      : 0;
    existingDay.net = existingDay.paid - existingDay.refunded;
    existingDay.bookings += 1;
    dailySalesMap.set(date, existingDay);
  }

  const dailySales = Array.from(dailySalesMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const paidTotal = dailySales.reduce((sum, item) => sum + item.paid, 0);
  const refundTotal = dailySales.reduce((sum, item) => sum + item.refunded, 0);
  const netTotal = paidTotal - refundTotal;

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">{common.backToMain}</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{t.subtitle(store.name)}</p>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-bold text-stone-900">{t.summaryHeading}</h2>

          <p className="text-4xl font-bold text-stone-900">
            ¥{netTotal.toLocaleString()}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-xl font-bold text-stone-900">
                ¥{paidTotal.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500">{t.paidLabel}</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-xl font-bold text-stone-900">
                ¥{refundTotal.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500">{t.refundedLabel}</p>
            </div>

            <div className="rounded-2xl bg-stone-100 p-3">
              <p className="text-xl font-bold text-stone-900">
                {bookings.length}
              </p>
              <p className="text-xs text-stone-500">{t.countLabel}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {dailySales.length > 0 ? (
            dailySales.map((item) => (
              <Card key={item.date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-900">{item.date}</p>
                    <p className="text-sm text-stone-500">
                      {t.bookingsCountSuffix(item.bookings)} / {t.refundedInlineLabel} ¥
                      {item.refunded.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-xl font-bold text-green-800">
                    ¥{item.net.toLocaleString()}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-stone-500">{t.emptyState}</p>
            </Card>
          )}
        </div>
      </div>
    </AdminFrame>
  );
}

