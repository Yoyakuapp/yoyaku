import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/clientIp";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createPasswordResetToken } from "@/lib/passwordResetTokens";
import { sendEmail } from "@/lib/resend";

const EMAIL_LIMIT_COUNT = 3;
const EMAIL_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const IP_LIMIT_COUNT = 8;
const IP_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const GENERIC_MESSAGE =
  "ご入力いただいたメールアドレス宛に、パスワード再設定のご案内をお送りしました。心当たりがない場合は、このメッセージを無視してください。";

const RATE_LIMITED_MESSAGE =
  "現在この操作を続けて行うことができません。しばらく時間をおいてからもう一度お試しください。";

const requestSchema = z.object({
  email: z.string().trim().email().max(200),
  turnstileToken: z.string().min(1),
});

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";
}

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

  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "メールアドレスをご確認ください。" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const ipAddress = getClientIp(request);
  const now = new Date();

  const [emailCount, ipCount] = await Promise.all([
    prisma.passwordResetRequestLog.count({
      where: {
        email,
        createdAt: { gte: new Date(now.getTime() - EMAIL_LIMIT_WINDOW_MS) },
      },
    }),
    ipAddress
      ? prisma.passwordResetRequestLog.count({
          where: {
            ipAddress,
            createdAt: { gte: new Date(now.getTime() - IP_LIMIT_WINDOW_MS) },
          },
        })
      : Promise.resolve(0),
  ]);

  if (emailCount >= EMAIL_LIMIT_COUNT || ipCount >= IP_LIMIT_COUNT) {
    await prisma.passwordResetRequestLog.create({
      data: { email, ipAddress },
    });
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 });
  }

  const turnstileOk = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    ipAddress
  );

  if (!turnstileOk) {
    await prisma.passwordResetRequestLog.create({
      data: { email, ipAddress },
    });
    return NextResponse.json(
      { error: "認証に失敗しました。もう一度お試しください。" },
      { status: 400 }
    );
  }

  await prisma.passwordResetRequestLog.create({
    data: { email, ipAddress },
  });

  const adminUser = await prisma.adminUser.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      active: true,
    },
    select: { id: true, name: true, email: true },
  });

  if (adminUser) {
    const token = await createPasswordResetToken(adminUser.id);
    const resetUrl = `${baseUrl()}/reset-password/${token}`;

    await sendEmail({
      to: adminUser.email,
      subject: "【Yoyakus】パスワード再設定のご案内",
      html: `
        <p>${escapeHtml(adminUser.name)} 様</p>
        <p>パスワード再設定のリクエストを受け付けました。以下のリンクから新しいパスワードを設定してください。</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>このリンクは60分間のみ有効で、1回のみご利用いただけます。心当たりがない場合は、このメールを破棄してください。</p>
      `,
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
