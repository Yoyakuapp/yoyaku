import { NextResponse } from "next/server";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { createOperatorLoginToken } from "@/lib/operatorLoginTokens";
import { prisma } from "@/lib/prisma";

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

  const token = await createOperatorLoginToken(membership.adminUserId);

  return NextResponse.json({ token });
}
