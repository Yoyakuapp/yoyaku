import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 2 * 60 * 1000;

export async function createOperatorLoginToken(adminUserId: string) {
  const token = randomBytes(24).toString("base64url");

  await prisma.operatorLoginToken.create({
    data: {
      token,
      adminUserId,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return token;
}
