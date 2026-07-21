import { getServerSession } from "next-auth";
import { cache } from "react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type StoreClient = Pick<typeof prisma, "store" | "storeMember">;

export class StoreResolutionError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403 | 404 | 500 = 500
  ) {
    super(message);
    this.name = "StoreResolutionError";
  }
}

export function isStoreResolutionError(
  error: unknown
): error is StoreResolutionError {
  return error instanceof StoreResolutionError;
}

export async function getDefaultStore(db: StoreClient = prisma) {
  const store = await db.store.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!store) {
    throw new StoreResolutionError("有効な店舗が設定されていません。");
  }

  return store;
}

export async function getPublicStoreBySlug(slug: string, db: StoreClient = prisma) {
  const store = await db.store.findFirst({
    where: {
      slug,
      isActive: true,
      isPublished: true,
    },
  });

  if (!store) {
    throw new StoreResolutionError("この店舗は現在ご利用いただけません。", 404);
  }

  return store;
}

export async function getAdminStoreMembership(
  db: StoreClient,
  adminUserId: string
) {
  return db.storeMember.findFirst({
    where: {
      adminUserId,
      store: {
        isActive: true,
      },
    },
    include: {
      store: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export const getStoreForAdminSession = cache(async function getStoreForAdminSession(
  db: StoreClient = prisma
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new StoreResolutionError("管理者ログインが必要です。", 401);
  }

  const membership = await getAdminStoreMembership(db, session.user.id);

  if (!membership) {
    throw new StoreResolutionError("この店舗を管理する権限がありません。", 403);
  }

  return {
    adminUserId: session.user.id,
    role: membership.role,
    store: membership.store,
  };
});
