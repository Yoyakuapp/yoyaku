import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { PrismaClient } from "@prisma/client";

import { authSecret } from "@/lib/authSecret";
import { prisma } from "@/lib/prisma";
import { verifyAdminLoginOtp } from "@/lib/adminLoginOtp";
import {
  clearLoginAttempts,
  isLockedOut,
  recordFailedLoginAttempt,
} from "@/lib/loginAttempts";

export type AdminAuthDb = Pick<
  PrismaClient,
  "adminUser" | "loginAttempt" | "adminLoginOtp"
>;
type OperatorTokenDb = Pick<PrismaClient, "adminUser" | "operatorLoginToken">;

export async function verifyAdminCredentials(
  email: string,
  password: string,
  db: AdminAuthDb = prisma
) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  if (await isLockedOut("ADMIN_LOGIN", normalizedEmail, db)) {
    return null;
  }

  const adminUser = await db.adminUser.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      active: true,
    },
  });

  if (!adminUser || !adminUser.active) {
    await recordFailedLoginAttempt("ADMIN_LOGIN", normalizedEmail, db);
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, adminUser.passwordHash);

  if (!passwordMatches) {
    await recordFailedLoginAttempt("ADMIN_LOGIN", normalizedEmail, db);
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
  };
}

export async function authenticateAdminUser(
  credentials:
    | {
        email?: string | null;
        password?: string | null;
        otp?: string | null;
      }
    | undefined,
  db: AdminAuthDb = prisma
) {
  const email = credentials?.email?.trim().toLowerCase();
  const password = credentials?.password ?? "";
  const otp = credentials?.otp ?? "";

  if (!email || !password) {
    return null;
  }

  const adminUser = await verifyAdminCredentials(email, password, db);

  if (!adminUser) {
    return null;
  }

  if (!otp) {
    return null;
  }

  if (await isLockedOut("ADMIN_OTP_VERIFY", adminUser.id, db)) {
    return null;
  }

  const otpValid = await verifyAdminLoginOtp(adminUser.id, otp, db);

  if (!otpValid) {
    await recordFailedLoginAttempt("ADMIN_OTP_VERIFY", adminUser.id, db);
    return null;
  }

  await clearLoginAttempts("ADMIN_LOGIN", email, db);
  await clearLoginAttempts("ADMIN_OTP_VERIFY", adminUser.id, db);

  return adminUser;
}

export async function authenticateWithOperatorToken(
  token: string | null | undefined,
  db: OperatorTokenDb = prisma
) {
  if (!token) {
    return null;
  }

  const record = await db.operatorLoginToken.findUnique({
    where: {
      token,
    },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await db.operatorLoginToken.update({
    where: {
      id: record.id,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const adminUser = await db.adminUser.findUnique({
    where: {
      id: record.adminUserId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      active: true,
    },
  });

  if (!adminUser || !adminUser.active) {
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: {
          label: "メールアドレス",
          type: "email",
        },
        password: {
          label: "パスワード",
          type: "password",
        },
        otp: {
          label: "確認コード",
          type: "text",
        },
        operatorToken: {
          label: "Operator Token",
          type: "text",
        },
      },
      async authorize(credentials) {
        const operatorToken = (
          credentials as { operatorToken?: string } | undefined
        )?.operatorToken;

        if (operatorToken) {
          return authenticateWithOperatorToken(operatorToken);
        }

        return authenticateAdminUser(credentials);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
};


