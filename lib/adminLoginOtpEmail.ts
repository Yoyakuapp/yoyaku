import { sendEmail } from "@/lib/resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendAdminLoginOtpEmail(
  to: string,
  name: string,
  code: string
) {
  const html = `
    <div style="font-family: sans-serif; color: #1c1917; line-height: 1.6;">
      <p>${escapeHtml(name)} 様</p>
      <p>管理画面へのログインを試みています。以下の確認コードを画面に入力してください。</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${escapeHtml(code)}</p>
      <p>このコードは5分間のみ有効です。心当たりがない場合は、このメールを破棄してください。</p>
      <p style="margin-top: 24px; font-size: 12px; color: #a8a29e;">
        このメールはYoyakus予約システムより自動送信されています。
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "【Yoyakus】管理画面ログインの確認コード",
    html,
  });
}

