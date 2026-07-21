import type { ReactNode } from "react";

import { getStoreForAdminSession } from "@/lib/currentStore";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { isSupportedLocale } from "@/lib/i18n/locales";

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  let initialLocale;

  try {
    const { store } = await getStoreForAdminSession();
    initialLocale = isSupportedLocale(store.adminLocale)
      ? store.adminLocale
      : undefined;
  } catch {
    initialLocale = undefined;
  }

  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>;
}
