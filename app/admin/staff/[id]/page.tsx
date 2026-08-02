import Link from "next/link";
import { notFound } from "next/navigation";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import StaffEditForm from "./StaffEditForm";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isSupportedLocale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

type StaffEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffEditPage({
  params,
}: StaffEditPageProps) {
  const { id } = await params;
  const { store } = await getStoreForAdminSession();
  const locale = isSupportedLocale(store.adminLocale)
    ? store.adminLocale
    : "ja";
  const t = dictionaries[locale].admin.staff;
  const tEdit = dictionaries[locale].admin.staffEdit;

  const staff = await prisma.staff.findUnique({
    where: {
      id,
      storeId: store.id,
    },
  });

  if (!staff) {
    notFound();
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link
          href="/admin/staff"
          className="text-sm font-bold text-stone-500"
        >
          {t.backLink}
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            {tEdit.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{tEdit.subtitle}</p>
        </Card>

        <StaffEditForm
          staff={{
            id: staff.id,
            name: staff.name,
            label: staff.label,
            gender: staff.gender,
            skills: staff.skills,
            active: staff.active,
          }}
        />
      </div>
    </AdminFrame>
  );
}
