import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

export async function createStoreInvite(label?: string) {
  const token = randomBytes(12).toString("base64url");

  const invite = await prisma.storeInvite.create({
    data: {
      token,
      label: label?.trim() || null,
    },
  });

  return invite;
}

export async function getActiveStoreInvite(token: string) {
  const invite = await prisma.storeInvite.findUnique({
    where: {
      token,
    },
  });

  if (!invite || invite.usedAt) {
    return null;
  }

  return invite;
}
