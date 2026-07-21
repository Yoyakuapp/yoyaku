"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { dictionaries } from "@/lib/i18n/dictionaries";
import {
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/locales";

type SignupFormProps = {
  token: string;
};

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function SignupForm({ token }: SignupFormProps) {
  const router = useRouter();

  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const t = dictionaries[locale].signup;

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const normalizedStoreName = storeName.trim();
    const normalizedSlug = slug.trim().toLowerCase();
    const normalizedOwnerName = ownerName.trim();
    const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();

    if (!normalizedStoreName) {
      setError(t.errorStoreNameRequired);
      return;
    }

    if (!slugPattern.test(normalizedSlug)) {
      setError(t.errorSlugInvalid);
      return;
    }

    if (!normalizedOwnerName) {
      setError(t.errorOwnerNameRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedOwnerEmail)) {
      setError(t.errorEmailInvalid);
      return;
    }

    if (ownerPassword.length < 12) {
      setError(t.errorPasswordTooShort);
      return;
    }

    if (ownerPassword !== ownerPasswordConfirm) {
      setError(t.errorPasswordMismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          storeName: normalizedStoreName,
          slug: normalizedSlug,
          ownerName: normalizedOwnerName,
          ownerEmail: normalizedOwnerEmail,
          ownerPassword,
          adminLocale: locale,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { slug?: string; error?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? t.errorGeneric);
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: normalizedOwnerEmail,
        password: ownerPassword,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        router.push("/login");
        return;
      }

      router.push("/admin");
      router.refresh();
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

        <h1 className="mt-2 text-3xl font-bold text-stone-900">{t.title}</h1>

        <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-5">
          <div>
            <label
              htmlFor="signup-store-name"
              className="block text-sm font-bold text-stone-800"
            >
              {t.storeNameLabel}
            </label>

            <input
              id="signup-store-name"
              type="text"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder={t.storeNamePlaceholder}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="signup-slug"
              className="block text-sm font-bold text-stone-800"
            >
              {t.slugLabel}
            </label>

            <div className="mt-2 flex items-center overflow-hidden rounded-xl border border-stone-300 bg-white focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/10">
              <span className="whitespace-nowrap bg-stone-100 px-3 py-3 text-sm text-stone-500">
                yoyakus.com/s/
              </span>

              <input
                id="signup-slug"
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="sakura-massage"
                className="w-full px-3 py-3 text-base text-stone-900 outline-none placeholder:text-stone-400"
                required
              />
            </div>

            <p className="mt-2 text-xs text-stone-500">{t.slugHint}</p>
          </div>

          <div>
            <label
              htmlFor="signup-owner-name"
              className="block text-sm font-bold text-stone-800"
            >
              {t.ownerNameLabel}
            </label>

            <input
              id="signup-owner-name"
              type="text"
              autoComplete="name"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
              placeholder={t.ownerNamePlaceholder}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-sm font-bold text-stone-800"
            >
              {t.emailLabel}
            </label>

            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              required
            />

            <p className="mt-2 text-xs text-stone-500">{t.emailHint}</p>
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-sm font-bold text-stone-800"
            >
              {t.passwordLabel}
            </label>

            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={ownerPassword}
              onChange={(event) => setOwnerPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              required
            />

            <p className="mt-2 text-xs text-stone-500">{t.passwordHint}</p>
          </div>

          <div>
            <label
              htmlFor="signup-password-confirm"
              className="block text-sm font-bold text-stone-800"
            >
              {t.passwordConfirmLabel}
            </label>

            <input
              id="signup-password-confirm"
              type="password"
              autoComplete="new-password"
              value={ownerPasswordConfirm}
              onChange={(event) => setOwnerPasswordConfirm(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              required
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
            >
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.submitButtonLoading : t.submitButton}
          </Button>
        </Card>
      </form>
    </div>
  );
}
