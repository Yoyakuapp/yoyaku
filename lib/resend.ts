const RESEND_API_URL = "https://api.resend.com/emails";

const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || "Yoyakus <noreply@yoyakus.com>";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
