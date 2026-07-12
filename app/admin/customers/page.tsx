import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";

type CustomerSummary = {
  key: string;
  name: string;
  phone: string;
  email: string;
  bookingCount: number;
  lastVisit: Date;
};

function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(date);
}

export default async function AdminCustomersPage() {
  const { store } = await getStoreForAdminSession();
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
            {store.name} の予約者情報と予約履歴を確認します。
          </p>
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
                    <p className="text-xs text-stone-500">予約回数</p>
                  </div>

                  <div className="rounded-2xl bg-stone-100 p-3">
                    <p className="text-sm font-bold text-stone-900">
                      {formatDate(customer.lastVisit, store.timezone)}
                    </p>
                    <p className="text-xs text-stone-500">最終予約日</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-stone-500">
                まだ予約者情報はありません。
              </p>
            </Card>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
