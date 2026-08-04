import { randomInt } from "node:crypto";

import bcrypt from "bcrypt";
import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AdminLoginOtpDb = Pick<PrismaClient, "adminLoginOtp">;

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

export async function createAdminLoginOtp(
  adminUserId: string,
  db: AdminLoginOtpDb = prisma
): Promise<string> {
  await db.adminLoginOtp.updateMany({
    where: {
      adminUserId,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  const code = randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
  const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);

  await db.adminLoginOtp.create({
    data: {
      adminUserId,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return code;
}

export async function verifyAdminLoginOtp(
  adminUserId: string,
  candidate: string,
  db: AdminLoginOtpDb = prisma
): Promise<boolean> {
  if (!candidate) {
    return false;
  }

  const record = await db.adminLoginOtp.findFirst({
    where: {
      adminUserId,
      consumedAt: null,
      expiresAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!record) {
    return false;
  }

  const matches = await bcrypt.compare(candidate, record.codeHash);

  if (!matches) {
    return false;
  }

  await db.adminLoginOtp.update({
    where: {
      id: record.id,
    },
    data: {
      consumedAt: new Date(),
    },
  });

  return true;
}

