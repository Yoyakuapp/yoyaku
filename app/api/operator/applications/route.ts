import { NextResponse } from "next/server";

import {
  getOperatorPasswordFromHeader,
  isValidOperatorPassword,
} from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json(
    { error: "パスワードが正しくありません。" },
    { status: 401 }
  );
}

export async function GET(request: Request) {
  const password = getOperatorPasswordFromHeader(request);

  if (!(await isValidOperatorPassword(request, password))) {
    return unauthorized();
  }

  const applications = await prisma.storeApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    applications: applications.map((application) => ({
      id: application.id,
      storeName: application.storeName,
      applicantName: application.applicantName,
      email: application.email,
      phone: application.phone,
      message: application.message,
      ipAddress: application.ipAddress,
      status: application.status,
      createdAt: application.createdAt,
    })),
  });
}


