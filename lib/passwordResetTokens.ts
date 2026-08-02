import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function createPasswordResetToken(adminUserId: string) {
  const token = randomBytes(24).toString("base64url");

  await prisma.passwordResetToken.create({
    data: {
      token,
      adminUserId,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return token;
}

export async function getActivePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: {
      token,
    },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  return record;
}

export async function consumePasswordResetToken(token: string) {
  const record = await getActivePasswordResetToken(token);

  if (!record) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: {
      id: record.id,
    },
    data: {
      usedAt: new Date(),
    },
  });

  return record;
}
