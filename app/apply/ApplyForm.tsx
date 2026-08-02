"use client";

import { FormEvent, useState } from "react";

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

export default function ApplyForm() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const t = dictionaries[locale].storeApplication;

  const [storeName, setStoreName] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
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
      const response = await fetch("/api/public/store-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          applicantName,
          email,
          phone,
          message,
          turnstileToken,
        }),
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
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>

        <h1 className="mt-2 text-2xl font-bold text-stone-900">{t.title}</h1>

        <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>
      </Card>

      {successMessage ? (
        <Card>
          <p className="text-sm font-bold text-green-800">{successMessage}</p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-5">
            <div>
              <label
                htmlFor="apply-store-name"
                className="block text-sm font-bold text-stone-800"
              >
                {t.storeNameLabel}
              </label>
              <input
                id="apply-store-name"
                type="text"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label
                htmlFor="apply-applicant-name"
                className="block text-sm font-bold text-stone-800"
              >
                {t.applicantNameLabel}
              </label>
              <input
                id="apply-applicant-name"
                type="text"
                value={applicantName}
                onChange={(event) => setApplicantName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label
                htmlFor="apply-email"
                className="block text-sm font-bold text-stone-800"
              >
                {t.emailLabel}
              </label>
              <input
                id="apply-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                required
              />
              <p className="mt-1 text-xs text-stone-400">{t.emailHint}</p>
            </div>

            <div>
              <label
                htmlFor="apply-phone"
                className="block text-sm font-bold text-stone-800"
              >
                {t.phoneLabel}
              </label>
              <input
                id="apply-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                maxLength={50}
              />
            </div>

            <div>
              <label
                htmlFor="apply-message"
                className="block text-sm font-bold text-stone-800"
              >
                {t.messageLabel}
              </label>
              <textarea
                id="apply-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                maxLength={2000}
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
          </Card>
        </form>
      )}
    </div>
  );
}
