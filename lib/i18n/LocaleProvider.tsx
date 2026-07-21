"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { dictionaries, type Dictionary } from "./dictionaries";
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from "./locales";

const LOCALE_COOKIE_NAME = "yoyaku_locale";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );

  if (!match) {
    return null;
  }

  const value = decodeURIComponent(match[1]);

  return isSupportedLocale(value) ? value : null;
}

function detectBrowserLocale(): Locale | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  for (const language of navigator.languages ?? [navigator.language]) {
    const prefix = language.slice(0, 2).toLowerCase();

    if (isSupportedLocale(prefix)) {
      return prefix;
    }
  }

  return null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(
    () => readLocaleCookie() ?? detectBrowserLocale() ?? DEFAULT_LOCALE
  );

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);

    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; max-age=${LOCALE_COOKIE_MAX_AGE}; path=/`;
    }
  }

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, dictionary: dictionaries[locale] }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  return context;
}
