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
import { submitSignup } from "./submitSignup";
import { WEEKDAY_LABELS } from "./weekdayLabels";

type SignupFormProps = {
  token: string;
  onBack: () => void;
};

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function SignupForm({ token, onBack }: SignupFormProps) {
  const router = useRouter();

  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const t = dictionaries[locale].signup;

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [staffNames, setStaffNames] = useState<string[]>([""]);
  const [openTime, setOpenTime] = useState("10:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [closedDays, setClosedDays] = useState<number[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleClosedDay(day: number) {
    setClosedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  }

  function updateStaffName(index: number, value: string) {
    setStaffNames((current) =>
      current.map((name, itemIndex) => (itemIndex === index ? value : name))
    );
  }

  function removeStaffField(index: number) {
    setStaffNames((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

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
      const { ok, data } = await submitSignup({
        token,
        storeName: normalizedStoreName,
        slug: normalizedSlug,
        ownerName: normalizedOwnerName,
        ownerEmail: normalizedOwnerEmail,
        ownerPassword,
        adminLocale: locale,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        staffNames: staffNames.map((name) => name.trim()).filter(Boolean),
        businessHours: {
          openTime,
          closeTime,
          closedDays,
        },
      });

      if (!ok) {
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

        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-sm font-bold text-green-800"
        >
          ← 登録方法の選択に戻る
        </button>
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
              htmlFor="signup-address"
              className="block text-sm font-bold text-stone-800"
            >
              住所(あとから入力してもかまいません)
            </label>

            <input
              id="signup-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="東京都〇〇区〇〇1-2-3"
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>

          <div>
            <label
              htmlFor="signup-phone"
              className="block text-sm font-bold text-stone-800"
            >
              電話番号(あとから入力してもかまいません)
            </label>

            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="03-1234-5678"
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>

          <div>
            <label
              htmlFor="signup-website"
              className="block text-sm font-bold text-stone-800"
            >
              ホームページ(あれば)
            </label>

            <input
              id="signup-website"
              type="text"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>

          <div>
            <p className="block text-sm font-bold text-stone-800">
              お店のスタッフ(あとから追加してもかまいません)
            </p>

            <div className="mt-2 space-y-2">
              {staffNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => updateStaffName(index, event.target.value)}
                    placeholder="山田 花子"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                  />
                  {staffNames.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeStaffField(index)}
                      className="text-xs font-bold text-red-700"
                    >
                      削除
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStaffNames((current) => [...current, ""])}
              className="mt-2 text-sm font-bold text-green-800"
            >
              + スタッフを追加
            </button>
          </div>

          <div>
            <p className="block text-sm font-bold text-stone-800">営業時間</p>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="time"
                value={openTime}
                onChange={(event) => setOpenTime(event.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              />
              <span className="text-sm text-stone-500">〜</span>
              <input
                type="time"
                value={closeTime}
                onChange={(event) => setCloseTime(event.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              />
            </div>
          </div>

          <div>
            <p className="block text-sm font-bold text-stone-800">定休日</p>

            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleClosedDay(day)}
                  className={
                    closedDays.includes(day)
                      ? "rounded-full border border-green-800 bg-green-800 px-4 py-2 text-sm font-bold text-white"
                      : "rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700"
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mt-2 text-xs text-stone-500">
              定休日にしたい曜日を選んでください。無ければ何も選ばなくて構いません。
            </p>
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
