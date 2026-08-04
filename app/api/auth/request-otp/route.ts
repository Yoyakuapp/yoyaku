import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAdminCredentials } from "@/lib/auth";
import { createAdminLoginOtp } from "@/lib/adminLoginOtp";
import { sendAdminLoginOtpEmail } from "@/lib/adminLoginOtpEmail";
import { isLockedOut, recordFailedLoginAttempt } from "@/lib/loginAttempts";

const GENERIC_ERROR = "メールアドレスまたはパスワードが正しくありません。";
const RATE_LIMITED_ERROR =
  "現在この操作を続けて行うことができません。しばらく時間をおいてからもう一度お試しください。";

const requestSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  if (await isLockedOut("ADMIN_OTP_REQUEST", email)) {
    return NextResponse.json({ error: RATE_LIMITED_ERROR }, { status: 429 });
  }

  await recordFailedLoginAttempt("ADMIN_OTP_REQUEST", email);

  const adminUser = await verifyAdminCredentials(email, parsed.data.password);

  if (!adminUser) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const code = await createAdminLoginOtp(adminUser.id);

  await sendAdminLoginOtpEmail(adminUser.email, adminUser.name, code);

  return NextResponse.json({ ok: true });
}

