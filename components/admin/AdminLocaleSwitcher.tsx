"use client";

import { useState } from "react";

import BottomSheet from "@/components/ui/BottomSheet";
import Icon from "@/components/ui/Icon";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";

export default function AdminLocaleSwitcher() {
  const { locale, dictionary } = useLocale();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function selectLocale(nextLocale: Locale) {
    if (nextLocale === locale || isSaving) {
      setOpen(false);
      return;
    }

    setIsSaving(true);

    const response = await fetch("/api/store", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminLocale: nextLocale,
      }),
    });

    if (response.ok) {
      window.location.reload();
      return;
    }

    setIsSaving(false);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dictionary.languagePicker.buttonLabel}
        className="mb-3 inline-flex shrink-0 items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition active:scale-[0.98]"
      >
        <Icon name="globe" className="h-3.5 w-3.5" />
        {LOCALE_LABELS[locale]}
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="言語 / Language"
      >
        <div className="space-y-2">
          {SUPPORTED_LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              disabled={isSaving}
              onClick={() => selectLocale(option)}
              className={
                option === locale
                  ? "flex w-full items-center justify-between rounded-2xl border border-green-800 bg-green-800 px-4 py-3 text-left font-bold text-white disabled:opacity-70"
                  : "flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left font-bold text-stone-900 disabled:opacity-70"
              }
            >
              {LOCALE_LABELS[option]}
              {option === locale ? (
                <Icon name="check" className="h-4 w-4" />
              ) : null}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
