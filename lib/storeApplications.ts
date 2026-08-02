import { prisma } from "@/lib/prisma";
import { createStoreInvite } from "@/lib/storeInvites";
import { sendEmail } from "@/lib/resend";

type SubmitStoreApplicationInput = {
  storeName: string;
  applicantName: string;
  email: string;
  phone?: string;
  message?: string;
  ipAddress: string | null;
};

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";
}

export async function submitStoreApplication(input: SubmitStoreApplicationInput) {
  const invite = await createStoreInvite(
    `${input.storeName}(${input.applicantName} / ${input.email})`
  );

  const application = await prisma.storeApplication.create({
    data: {
      storeName: input.storeName,
      applicantName: input.applicantName,
      email: input.email,
      phone: input.phone?.trim() || null,
      message: input.message?.trim() || null,
      ipAddress: input.ipAddress,
      status: "ISSUED",
      inviteId: invite.id,
    },
  });

  const inviteUrl = `${baseUrl()}/signup/${invite.token}`;

  const emailSent = await sendEmail({
    to: input.email,
    subject: "【Yoyakus】お申し込みありがとうございます",
    html: `
      <p>${escapeHtml(input.applicantName)} 様</p>
      <p>Yoyakusへのお申し込みありがとうございます。以下のリンクから店舗の登録手続きを行ってください。</p>
      <p><a href="${inviteUrl}">${inviteUrl}</a></p>
      <p>このリンクは1回のみご利用いただけます。心当たりがない場合は、このメールを破棄してください。</p>
    `,
  });

  return { application, invite, emailSent };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
