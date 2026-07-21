export const SUPPORTED_LOCALES = ["ja", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ja";

export const LOCALE_LABELS: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
};

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
