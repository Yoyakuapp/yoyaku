import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getOperatorPasswordFromHeader,
  isValidOperatorPassword,
} from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

type NoticeRouteContext = {
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

const updateSchema = z.object({
  password: z.string().min(1),
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
});

export async function PUT(request: Request, context: NoticeRouteContext) {
  const { id } = await context.params;

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

  const parsed = updateSchema.safeParse(json);

  if (
    !parsed.success ||
    !(await isValidOperatorPassword(request, parsed.data.password))
  ) {
    return unauthorized();
  }

  const notice = await prisma.operatorNotice.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!notice) {
    return NextResponse.json(
      {
        error: "注意事項が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  const updated = await prisma.operatorNotice.update({
    where: { id },
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
    },
  });

  return NextResponse.json({ notice: updated });
}

export async function DELETE(request: Request, context: NoticeRouteContext) {
  const { id } = await context.params;
  const password = getOperatorPasswordFromHeader(request);

  if (!(await isValidOperatorPassword(request, password))) {
    return unauthorized();
  }

  const notice = await prisma.operatorNotice.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!notice) {
    return NextResponse.json(
      {
        error: "注意事項が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  await prisma.operatorNotice.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}


