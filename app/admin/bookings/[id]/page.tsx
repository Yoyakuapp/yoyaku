import Link from "next/link";
import { notFound } from "next/navigation";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import BookingRescheduleForm from "./BookingRescheduleForm";
import BookingStatusActions from "./BookingStatusActions";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/intlLocale";

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
  const locale = isSupportedLocale(store.adminLocale) ? store.adminLocale : "ja";
  const t = dictionaries[locale].admin.bookingDetail;
  const common = dictionaries[locale].admin.common;
  const intlLocale = INTL_LOCALE_TAGS[locale];

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

  const date = new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: store.timezone,
  }).format(booking.date);

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link
          href="/admin/bookings"
          className="text-sm font-bold text-stone-500"
        >
          {t.backLink}
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            {booking.bookingNo}
          </p>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-sm text-stone-500">{t.statusLabel}</p>
            <p className="mt-1 text-xl font-bold text-stone-900">
              {common.bookingStatusLabels[booking.status]}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.dateTimeLabel}</p>
            <p className="mt-1 font-bold text-stone-900">{date}</p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.customerNameLabel}</p>
            <p className="mt-1 font-bold text-stone-900">
              {booking.customer}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.phoneLabel}</p>
            <p className="mt-1 font-bold text-stone-900">
              {booking.phone}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.emailLabel}</p>
            <p className="mt-1 break-all font-bold text-stone-900">
              {booking.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.treatmentLabel}</p>
            <p className="mt-1 font-bold text-stone-900">
              {t.treatmentSummary(booking.menu, booking.duration, booking.people)}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.staffLabel}</p>
            <p className="mt-1 font-bold text-stone-900">
              {booking.staff}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.priceLabel}</p>
            <p className="mt-1 font-bold text-stone-900">
              ¥{booking.amount.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.depositLabel}</p>
            <p className="mt-1 font-bold text-stone-900">
              ¥{booking.deposit.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-stone-500">{t.memoLabel}</p>
            <p className="mt-1 whitespace-pre-wrap text-stone-900">
              {booking.memo || t.memoNone}
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

