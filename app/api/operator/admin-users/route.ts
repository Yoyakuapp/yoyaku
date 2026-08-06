import { NextResponse } from "next/server";

import {
  getOperatorPasswordFromHeader,
  isValidOperatorPassword,
} from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const password = getOperatorPasswordFromHeader(request);

  if (!(await isValidOperatorPassword(request, password))) {
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


