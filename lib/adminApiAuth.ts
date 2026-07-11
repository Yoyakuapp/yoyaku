import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getMissingEnvironmentKeys } from "@/lib/env";

export async function requireAdminApiSession() {
  const missingAuthKeys = getMissingEnvironmentKeys([
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ]);

  if (missingAuthKeys.length > 0) {
    return NextResponse.json(
      {
        error: "認証設定が不足しています。",
      },
      {
        status: 500,
      }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "管理者ログインが必要です。",
      },
      {
        status: 401,
      }
    );
  }

  return null;
}
