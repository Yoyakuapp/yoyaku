import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { isStaffGender } from "@/lib/staffGender";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const { store } = await getStoreForAdminSession();
  const admin = dictionaries[
    isSupportedLocale(store.adminLocale) ? store.adminLocale : "ja"
  ].admin;
  const t = admin.staff;

  const staff = await prisma.staff.findMany({
    where: {
      storeId: store.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">{admin.common.backToMain}</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>
        </Card>

        <Link href="/admin/staff/new">
          <Button>{t.addNewButton}</Button>
        </Link>

        {staff.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              {t.emptyState}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {staff.map((person) => (
              <Card key={person.id} className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900">
                      {person.name}
                    </h2>

                    <p className="text-sm text-stone-500">
                      {person.label || t.noDescription}
                      {isStaffGender(person.gender)
                        ? ` ・ ${t.genderLabels[person.gender]}`
                        : ""}
                    </p>
                  </div>

                  <span
                    className={
                      person.active
                        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                        : "rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500"
                    }
                  >
                    {person.active ? t.activeLabel : t.inactiveLabel}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {person.skills.length === 0 ? (
                    <span className="text-xs text-stone-400">
                      {t.noSkills}
                    </span>
                  ) : (
                    person.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>

                <Link href={`/admin/staff/${person.id}`}>
                  <Button variant="secondary">{t.editButton}</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminFrame>
  );
}
