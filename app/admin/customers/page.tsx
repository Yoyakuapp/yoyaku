import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/intlLocale";

type CustomerSummary = {
  key: string;
  name: string;
  phone: string;
  email: string;
  bookingCount: number;
  lastVisit: Date;
};

function formatDate(date: Date, timeZone: string, intlLocale: string) {
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(date);
}

export default async function AdminCustomersPage() {
  const { store } = await getStoreForAdminSession();
  const locale = isSupportedLocale(store.adminLocale) ? store.adminLocale : "ja";
  const t = dictionaries[locale].admin.customers;
  const common = dictionaries[locale].admin.common;
  const intlLocale = INTL_LOCALE_TAGS[locale];

  const bookings = await prisma.booking.findMany({
    where: {
      storeId: store.id,
    },
    select: {
      customer: true,
      phone: true,
      email: true,
      date: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  const customerMap = new Map<string, CustomerSummary>();

  for (const booking of bookings) {
    const key = `${booking.email.toLowerCase()}:${booking.phone}`;
    const existingCustomer = customerMap.get(key);

    if (existingCustomer) {
      existingCustomer.bookingCount += 1;
      if (booking.date > existingCustomer.lastVisit) {
        existingCustomer.lastVisit = booking.date;
      }
      continue;
    }

    customerMap.set(key, {
      key,
      name: booking.customer,
      phone: booking.phone,
      email: booking.email,
      bookingCount: 1,
      lastVisit: booking.date,
    });
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.lastVisit.getTime() - a.lastVisit.getTime()
  );

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

        <div className="space-y-3">
          {customers.length > 0 ? (
            customers.map((customer) => (
              <Card key={customer.key} className="space-y-3">
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
                      {customer.bookingCount}
                    </p>
                    <p className="text-xs text-stone-500">{t.bookingCountLabel}</p>
                  </div>

                  <div className="rounded-2xl bg-stone-100 p-3">
                    <p className="text-sm font-bold text-stone-900">
                      {formatDate(customer.lastVisit, store.timezone, intlLocale)}
                    </p>
                    <p className="text-xs text-stone-500">{t.lastVisitLabel}</p>
                  </div>
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

