import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type LoginAttemptDb = Pick<PrismaClient, "loginAttempt">;

export type LoginAttemptScope = "ADMIN_LOGIN" | "OPERATOR";

const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export async function isLockedOut(
  scope: LoginAttemptScope,
  identifier: string,
  db: LoginAttemptDb = prisma
): Promise<boolean> {
  if (!identifier) {
    return false;
  }

  const count = await db.loginAttempt.count({
    where: {
      scope,
      identifier,
      createdAt: {
        gte: new Date(Date.now() - LOCKOUT_WINDOW_MS),
      },
    },
  });

  return count >= LOCKOUT_THRESHOLD;
}

export async function recordFailedLoginAttempt(
  scope: LoginAttemptScope,
  identifier: string,
  db: LoginAttemptDb = prisma
): Promise<void> {
  if (!identifier) {
    return;
  }

  await db.loginAttempt.create({
    data: {
      scope,
      identifier,
    },
  });
}

export async function clearLoginAttempts(
  scope: LoginAttemptScope,
  identifier: string,
  db: LoginAttemptDb = prisma
): Promise<void> {
  if (!identifier) {
    return;
  }

  await db.loginAttempt.deleteMany({
    where: {
      scope,
      identifier,
    },
  });
}

