"use client";

import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AdminCalendar from "@/components/admin/AdminCalendar";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function StaffSchedulePage() {
  const { dictionary } = useLocale();
  const t = dictionary.admin.staffSchedule;

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">{dictionary.admin.common.backToMain}</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>
        </Card>

        <AdminCalendar />

        <div className="space-y-3">
          <Link href="/admin/shifts">
            <Button variant="secondary">{t.shiftsButton}</Button>
          </Link>

          <Link href="/admin/hours">
            <Button variant="secondary">{t.hoursButton}</Button>
          </Link>

          <Link href="/admin/holidays">
            <Button variant="secondary">{t.holidaysButton}</Button>
          </Link>
        </div>
      </div>
    </AdminFrame>
  );
}

