"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AdminCalendar from "@/components/admin/AdminCalendar";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function StaffSchedulePage() {
  const router = useRouter();
  const { dictionary } = useLocale();
  const t = dictionary.admin.staffSchedule;

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/shifts">
            <Button variant="secondary" className="w-auto px-4">
              {t.shiftsButton}
            </Button>
          </Link>

          <Link href="/admin/hours">
            <Button variant="secondary" className="w-auto px-4">
              {t.hoursButton}
            </Button>
          </Link>

          <Link href="/admin/holidays">
            <Button variant="secondary" className="w-auto px-4">
              {t.holidaysButton}
            </Button>
          </Link>
        </div>

        <Button variant="secondary" onClick={() => router.back()}>
          {dictionary.admin.common.back}
        </Button>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>
        </Card>

        <AdminCalendar />
      </div>
    </AdminFrame>
  );
}


