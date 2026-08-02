"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TurnstileWidget from "@/components/turnstile/TurnstileWidget";
import { dictionaries } from "@/lib/i18n/dictionaries";
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/locales";

export default function ForgotPasswordForm() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const t = dictionaries[locale].passwordResetRequest;

  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!turnstileToken) {
      setError(t.turnstileRequiredError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? t.errorGeneric);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(data?.message ?? t.errorGeneric);
    } catch {
      setError(t.errorGeneric);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <p className="text-sm font-bold text-stone-600">言語 / Language</p>

        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLocale(option)}
              className={
                option === locale
                  ? "rounded-full border border-green-800 bg-green-800 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700"
              }
            >
              {LOCALE_LABELS[option]}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

        <h1 className="mt-2 text-2xl font-bold text-stone-900">{t.title}</h1>

        <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>
      </Card>

      {successMessage ? (
        <Card className="space-y-4">
          <p className="text-sm font-bold text-green-800">{successMessage}</p>

          <Link href="/login" className="block">
            <Button variant="secondary">{t.backToLoginLink}</Button>
          </Link>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-5">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-bold text-stone-800"
              >
                {t.emailLabel}
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />
            </div>

            <TurnstileWidget onVerify={setTurnstileToken} />

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting || !turnstileToken}>
              {isSubmitting ? t.submitButtonLoading : t.submitButton}
            </Button>

            <Link
              href="/login"
              className="block text-center text-sm font-bold text-green-800"
            >
              {t.backToLoginLink}
            </Link>
          </Card>
        </form>
      )}
    </div>
  );
}
