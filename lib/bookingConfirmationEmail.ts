import { sendEmail } from "@/lib/resend";

type BookingConfirmationStore = {
  name: string;
  timezone: string;
  phone: string | null;
};

type BookingConfirmationBooking = {
  bookingNo: string;
  customer: string;
  email: string;
  date: Date;
  duration: number;
  people: number;
  staff: string;
  menu: string;
  amount: number;
  deposit: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBookingDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

export async function sendBookingConfirmationEmail(
  booking: BookingConfirmationBooking,
  store: BookingConfirmationStore
) {
  const dateTimeText = formatBookingDateTime(booking.date, store.timezone);

  const html = `
    <div style="font-family: sans-serif; color: #1c1917; line-height: 1.6;">
      <p>${escapeHtml(booking.customer)} 様</p>
      <p>${escapeHtml(store.name)} のご予約が確定しました。</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; color: #78716c;">予約番号</td><td>${escapeHtml(booking.bookingNo)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #78716c;">予約日時</td><td>${escapeHtml(dateTimeText)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #78716c;">メニュー</td><td>${escapeHtml(booking.menu)}(${booking.duration}分・${booking.people}人)</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #78716c;">担当</td><td>${escapeHtml(booking.staff)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #78716c;">施術料金</td><td>¥${booking.amount.toLocaleString()}</td></tr>
        ${
          booking.deposit > 0
            ? `<tr><td style="padding: 4px 12px 4px 0; color: #78716c;">お支払い済み予約金</td><td>¥${booking.deposit.toLocaleString()}</td></tr>`
            : ""
        }
      </table>
      <p>
        ご予約の変更・キャンセルについては、店舗まで直接ご連絡ください。
        ${store.phone ? `<br>電話番号: ${escapeHtml(store.phone)}` : ""}
      </p>
      <p style="margin-top: 24px; font-size: 12px; color: #a8a29e;">
        このメールはYoyakus予約システムより自動送信されています。
      </p>
    </div>
  `;

  return sendEmail({
    to: booking.email,
    subject: `【${store.name}】ご予約確定のお知らせ(${booking.bookingNo})`,
    html,
  });
}

