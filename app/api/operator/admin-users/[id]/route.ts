import { NextResponse } from "next/server";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

type AdminUserRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, context: AdminUserRouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return NextResponse.json(
      {
        error: "パスワードが正しくありません。",
      },
      {
        status: 401,
      }
    );
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: { storeMembers: true },
      },
    },
  });

  if (!adminUser) {
    return NextResponse.json(
      {
        error: "アカウントが見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  if (adminUser._count.storeMembers > 0) {
    return NextResponse.json(
      {
        error: "このアカウントはまだ店舗に所属しているため削除できません。",
      },
      {
        status: 409,
      }
    );
  }

  await prisma.adminUser.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
