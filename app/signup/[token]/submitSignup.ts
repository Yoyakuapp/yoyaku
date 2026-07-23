import type { Locale } from "@/lib/i18n/locales";

export type BusinessHoursDraft = {
  openTime: string;
  closeTime: string;
  closedDays: number[];
};

export type SignupPayload = {
  token: string;
  storeName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  adminLocale: Locale;
  address?: string;
  phone?: string;
  websiteUrl?: string;
  staffNames?: string[];
  businessHours?: BusinessHoursDraft;
};

export async function submitSignup(payload: SignupPayload) {
  const response = await fetch("/api/public/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | { slug?: string; error?: string }
    | null;

  return { ok: response.ok, data };
}
