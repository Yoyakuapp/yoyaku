import Link from "next/link";
import { notFound } from "next/navigation";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import StaffEditForm from "./StaffEditForm";
import { getStoreForAdminSession } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";

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
          ← 施術者管理
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            施術者編集
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            施術者情報を編集します。
          </p>
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
