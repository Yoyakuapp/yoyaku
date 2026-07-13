import { getServerSession } from "next-auth";
import type { Store } from "@prisma/client";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  getStoreForAdminSession,
  isStoreResolutionError,
} from "@/lib/currentStore";
import { getMissingEnvironmentKeys } from "@/lib/env";

export async function requireAdminApiSession() {
  const missingAuthKeys = getMissingEnvironmentKeys([
    "NEXTAUTH_SECRET",
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

type AdminApiStoreResult =
  | {
      response: NextResponse;
      store: null;
      adminUserId: null;
    }
  | {
      response: null;
      store: Store;
      adminUserId: string;
    };

export async function requireAdminApiStore(): Promise<AdminApiStoreResult> {
  const missingAuthKeys = getMissingEnvironmentKeys([
    "NEXTAUTH_SECRET",
  ]);

  if (missingAuthKeys.length > 0) {
    return {
      response: NextResponse.json(
        {
          error: "認証設定が不足しています。",
        },
        {
          status: 500,
        }
      ),
      store: null,
      adminUserId: null,
    };
  }

  try {
    const adminStore = await getStoreForAdminSession();

    return {
      response: null,
      store: adminStore.store,
      adminUserId: adminStore.adminUserId,
    };
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return {
        response: NextResponse.json(
          {
            error: error.message,
          },
          {
            status: error.status,
          }
        ),
        store: null,
        adminUserId: null,
      };
    }

    return {
      response: NextResponse.json(
        {
          error: "管理権限を確認できませんでした。",
        },
        {
          status: 500,
        }
      ),
      store: null,
      adminUserId: null,
    };
  }
}
