"use client";

import { useState } from "react";

import BottomSheet from "@/components/ui/BottomSheet";
import Icon from "@/components/ui/Icon";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n/locales";

export default function LanguageSwitcher() {
  const { locale, setLocale, dictionary } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dictionary.languagePicker.buttonLabel}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm transition active:scale-[0.98]"
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
              onClick={() => {
                setLocale(option);
                setOpen(false);
              }}
              className={
                option === locale
                  ? "flex w-full items-center justify-between rounded-2xl border border-green-800 bg-green-800 px-4 py-3 text-left font-bold text-white"
                  : "flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left font-bold text-stone-900"
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
