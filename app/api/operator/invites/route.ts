import { NextResponse } from "next/server";
import { z } from "zod";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { createStoreInvite } from "@/lib/storeInvites";
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

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";
}

function serializeInvite(invite: {
  id: string;
  label: string | null;
  token: string;
  usedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: invite.id,
    label: invite.label,
    url: `${baseUrl()}/signup/${invite.token}`,
    usedAt: invite.usedAt,
    createdAt: invite.createdAt,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return unauthorized();
  }

  const invites = await prisma.storeInvite.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return NextResponse.json({
    invites: invites.map(serializeInvite),
  });
}

const createSchema = z.object({
  password: z.string().min(1),
  label: z.string().trim().max(200).optional(),
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

  const invite = await createStoreInvite(parsed.data.label);

  return NextResponse.json({
    invite: serializeInvite(invite),
  });
}
