import { randomBytes } from "node:crypto";

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 12;

type StoreRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function unauthorized() {
  return NextResponse.json(
    {
      error: "パスワードが正しくありません。",
    },
    {
      status: 401,
    }
  );
}

export async function POST(request: Request, context: StoreRouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return unauthorized();
  }

  const membership = await prisma.storeMember.findFirst({
    where: {
      storeId: id,
    },
    include: {
      adminUser: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!membership) {
    return NextResponse.json(
      {
        error: "この店舗にはログインアカウントがありません。",
      },
      {
        status: 404,
      }
    );
  }

  const newPassword = randomBytes(12).toString("base64url");
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.adminUser.update({
    where: {
      id: membership.adminUserId,
    },
    data: {
      passwordHash,
    },
  });

  return NextResponse.json({
    email: membership.adminUser.email,
    password: newPassword,
  });
}
