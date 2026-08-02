import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/clientIp";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { submitStoreApplication } from "@/lib/storeApplications";

const IP_LIMIT_COUNT = 5;
const IP_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_LIMIT_COUNT = 3;
const EMAIL_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const RATE_LIMITED_MESSAGE =
  "現在この操作を続けて行うことができません。しばらく時間をおいてからもう一度お試しください。";

const GENERIC_SUCCESS_MESSAGE =
  "お申し込みを受け付けました。ご入力いただいたメールアドレス宛に、登録用のご案内をお送りします。";

const applicationSchema = z.object({
  storeName: z.string().trim().min(1).max(200),
  applicantName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().max(2000).optional(),
  turnstileToken: z.string().min(1),
});

async function recordRejected(
  data: z.infer<typeof applicationSchema>,
  ipAddress: string | null
) {
  await prisma.storeApplication.create({
    data: {
      storeName: data.storeName,
      applicantName: data.applicantName,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      ipAddress,
      status: "REJECTED",
    },
  });
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

  const parsed = applicationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力内容をご確認ください。" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const ipAddress = getClientIp(request);
  const now = new Date();

  const [ipCount, emailCount] = await Promise.all([
    ipAddress
      ? prisma.storeApplication.count({
          where: {
            ipAddress,
            createdAt: { gte: new Date(now.getTime() - IP_LIMIT_WINDOW_MS) },
          },
        })
      : Promise.resolve(0),
    prisma.storeApplication.count({
      where: {
        email: data.email,
        createdAt: { gte: new Date(now.getTime() - EMAIL_LIMIT_WINDOW_MS) },
      },
    }),
  ]);

  if (ipCount >= IP_LIMIT_COUNT || emailCount >= EMAIL_LIMIT_COUNT) {
    await recordRejected(data, ipAddress);
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 });
  }

  const turnstileOk = await verifyTurnstileToken(data.turnstileToken, ipAddress);

  if (!turnstileOk) {
    await recordRejected(data, ipAddress);
    return NextResponse.json(
      { error: "認証に失敗しました。もう一度お試しください。" },
      { status: 400 }
    );
  }

  await submitStoreApplication({
    storeName: data.storeName,
    applicantName: data.applicantName,
    email: data.email,
    phone: data.phone,
    message: data.message,
    ipAddress,
  });

  return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
}
