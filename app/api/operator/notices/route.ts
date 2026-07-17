import { NextResponse } from "next/server";
import { z } from "zod";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return unauthorized();
  }

  const notices = await prisma.operatorNotice.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ notices });
}

const createSchema = z.object({
  password: z.string().min(1),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
});

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "リクエスト内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const parsed = createSchema.safeParse(json);

  if (!parsed.success || !isValidOperatorPassword(parsed.data.password)) {
    return unauthorized();
  }

  const maxOrder = await prisma.operatorNotice.aggregate({
    _max: {
      displayOrder: true,
    },
  });

  const notice = await prisma.operatorNotice.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ notice });
}
