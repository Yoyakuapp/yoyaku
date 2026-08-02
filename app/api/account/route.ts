import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminApiStore } from "@/lib/adminApiAuth";

const BCRYPT_ROUNDS = 12;

export async function GET() {
  const { response, adminUserId } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
    select: { email: true, name: true },
  });

  if (!adminUser) {
    return NextResponse.json(
      { error: "アカウントが見つかりません。" },
      { status: 404 }
    );
  }

  return NextResponse.json(adminUser);
}

const emailSchema = z.object({
  action: z.literal("email"),
  currentPassword: z.string().min(1),
  newEmail: z.string().trim().email().max(200),
});

const passwordSchema = z.object({
  action: z.literal("password"),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(200),
});

export async function PUT(request: Request) {
  const { response, adminUserId } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト内容が正しくありません。" },
      { status: 400 }
    );
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { id: adminUserId },
  });

  if (!adminUser) {
    return NextResponse.json(
      { error: "アカウントが見つかりません。" },
      { status: 404 }
    );
  }

  const emailParsed = emailSchema.safeParse(json);

  if (emailParsed.success) {
    const passwordMatches = await bcrypt.compare(
      emailParsed.data.currentPassword,
      adminUser.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません。" },
        { status: 401 }
      );
    }

    try {
      await prisma.adminUser.update({
        where: { id: adminUserId },
        data: { email: emailParsed.data.newEmail.toLowerCase() },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "このメールアドレスは既に使用されています。" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ message: "メールアドレスを変更しました。" });
  }

  const passwordParsed = passwordSchema.safeParse(json);

  if (passwordParsed.success) {
    const passwordMatches = await bcrypt.compare(
      passwordParsed.data.currentPassword,
      adminUser.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません。" },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(
      passwordParsed.data.newPassword,
      BCRYPT_ROUNDS
    );

    await prisma.adminUser.update({
      where: { id: adminUserId },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "パスワードを変更しました。" });
  }

  return NextResponse.json(
    { error: "入力内容をご確認ください。" },
    { status: 400 }
  );
}
