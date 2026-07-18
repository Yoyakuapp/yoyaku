import { NextResponse } from "next/server";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return NextResponse.json(
      {
        error: "パスワードが正しくありません。",
      },
      {
        status: 401,
      }
    );
  }

  const adminUsers = await prisma.adminUser.findMany({
    where: {
      storeMembers: {
        none: {},
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ adminUsers });
}
