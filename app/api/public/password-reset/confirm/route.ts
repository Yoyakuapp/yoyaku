import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { consumePasswordResetToken } from "@/lib/passwordResetTokens";

const BCRYPT_ROUNDS = 12;

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(12).max(200),
});

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト内容が正しくありません。" },
      { status: 400 }
    );
  }

  const parsed = confirmSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "パスワードは12文字以上で入力してください。" },
      { status: 400 }
    );
  }

  const record = await consumePasswordResetToken(parsed.data.token);

  if (!record) {
    return NextResponse.json(
      { error: "このリンクは無効か、既に使用済みです。もう一度パスワード再設定をお申し込みください。" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);

  await prisma.adminUser.update({
    where: { id: record.adminUserId },
    data: { passwordHash },
  });

  return NextResponse.json({ message: "パスワードを再設定しました。新しいパスワードでログインしてください。" });
}
