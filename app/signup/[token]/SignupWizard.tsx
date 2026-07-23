"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { DEFAULT_LOCALE, LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locales";
import { submitSignup, type StaffDraft } from "./submitSignup";
import { WEEKDAY_LABELS } from "./weekdayLabels";
import {
  STAFF_GENDER_LABELS,
  STAFF_GENDER_OPTIONS,
} from "@/lib/staffGender";

type SignupWizardProps = {
  token: string;
  onBack: () => void;
};

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const TOTAL_STEPS = 11;

export default function SignupWizard({ token, onBack }: SignupWizardProps) {
  const router = useRouter();

  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [staffDrafts, setStaffDrafts] = useState<StaffDraft[]>([
    { name: "", gender: null },
  ]);
  const [openTime, setOpenTime] = useState("10:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [closedDays, setClosedDays] = useState<number[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");

  function toggleClosedDay(day: number) {
    setClosedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  }

  function updateStaffName(index: number, value: string) {
    setStaffDrafts((current) =>
      current.map((staff, itemIndex) =>
        itemIndex === index ? { ...staff, name: value } : staff
      )
    );
  }

  function updateStaffGender(
    index: number,
    value: StaffDraft["gender"]
  ) {
    setStaffDrafts((current) =>
      current.map((staff, itemIndex) =>
        itemIndex === index
          ? { ...staff, gender: staff.gender === value ? null : value }
          : staff
      )
    );
  }

  function removeStaffField(index: number) {
    setStaffDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function goBack() {
    setError("");

    if (step === 0) {
      onBack();
      return;
    }

    setStep((current) => current - 1);
  }

  function goNext() {
    setError("");

    if (step === 0 && !storeName.trim()) {
      setError("店舗名を入力してください。");
      return;
    }

    if (step === 1 && !slugPattern.test(slug.trim().toLowerCase())) {
      setError(
        "URLに使う識別子は、半角小文字・数字・ハイフンのみで入力してください。"
      );
      return;
    }

    if (step === 8 && !ownerName.trim()) {
      setError("お名前を入力してください。");
      return;
    }

    if (step === 9 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) {
      setError("メールアドレスを正しく入力してください。");
      return;
    }

    setStep((current) => current + 1);
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    setError("");

    if (ownerPassword.length < 12) {
      setError("パスワードは12文字以上で入力してください。");
      return;
    }

    if (ownerPassword !== ownerPasswordConfirm) {
      setError("パスワードが一致しません。");
      return;
    }

    const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();

    setIsSubmitting(true);

    try {
      const { ok, data } = await submitSignup({
        token,
        storeName: storeName.trim(),
        slug: slug.trim().toLowerCase(),
        ownerName: ownerName.trim(),
        ownerEmail: normalizedOwnerEmail,
        ownerPassword,
        adminLocale: locale,
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        staff: staffDrafts
          .map((staff) => ({ ...staff, name: staff.name.trim() }))
          .filter((staff) => staff.name.length > 0),
        businessHours: {
          openTime,
          closeTime,
          closedDays,
        },
      });

      if (!ok) {
        setError(data?.error ?? "登録に失敗しました。");
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
      setError("登録に失敗しました。");
      setIsSubmitting(false);
    }
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  function renderQuestion() {
    switch (step) {
      case 0:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              お店の名前は何ですか？
            </p>
            <input
              type="text"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder="さくらマッサージ"
              autoFocus
              className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>
        );
      case 1:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              予約ページのアドレスに使う識別子は？
            </p>
            <p className="mt-2 text-sm text-stone-500">
              半角小文字・数字・ハイフンのみ使用できます。
            </p>
            <div className="mt-4 flex items-center overflow-hidden rounded-xl border border-stone-300 bg-white focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/10">
              <span className="whitespace-nowrap bg-stone-100 px-3 py-3 text-sm text-stone-500">
                yoyakus.com/s/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="sakura-massage"
                autoFocus
                className="w-full px-3 py-3 text-base text-stone-900 outline-none placeholder:text-stone-400"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">住所は？</p>
            <p className="mt-2 text-sm text-stone-500">
              あとから入力することもできます。
            </p>
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="東京都〇〇区〇〇1-2-3"
              autoFocus
              className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>
        );
      case 3:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">電話番号は？</p>
            <p className="mt-2 text-sm text-stone-500">
              あとから入力することもできます。
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="03-1234-5678"
              autoFocus
              className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>
        );
      case 4:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              ホームページはありますか？
            </p>
            <p className="mt-2 text-sm text-stone-500">
              なければ空欄のまま次へ進んでください。
            </p>
            <input
              type="text"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>
        );
      case 5:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              お店のスタッフを教えてください。
            </p>
            <p className="mt-2 text-sm text-stone-500">
              あとから追加することもできます。
            </p>
            <div className="mt-4 space-y-3">
              {staffDrafts.map((staff, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-xl border border-stone-200 p-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={staff.name}
                      onChange={(event) => updateStaffName(index, event.target.value)}
                      placeholder="山田 花子"
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
                    />
                    {staffDrafts.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeStaffField(index)}
                        className="text-xs font-bold text-red-700"
                      >
                        削除
                      </button>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STAFF_GENDER_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateStaffGender(index, option)}
                        className={
                          staff.gender === option
                            ? "rounded-full border border-green-800 bg-green-800 px-3 py-1.5 text-xs font-bold text-white"
                            : "rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700"
                        }
                      >
                        {STAFF_GENDER_LABELS[option]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setStaffDrafts((current) => [...current, { name: "", gender: null }])
              }
              className="mt-2 text-sm font-bold text-green-800"
            >
              + スタッフを追加
            </button>
          </div>
        );
      case 6:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              お店の営業時間は？
            </p>
            <div className="mt-4 flex items-center gap-2">
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
        );
      case 7:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              お店の定休日はありますか？
            </p>
            <p className="mt-2 text-sm text-stone-500">
              定休日にしたい曜日を選んでください。無ければ何も選ばず次へ進んでください。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
          </div>
        );
      case 8:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              あなたのお名前は？
            </p>
            <input
              type="text"
              autoComplete="name"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
              placeholder="山田 太郎"
              autoFocus
              className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>
        );
      case 9:
        return (
          <div>
            <p className="text-lg font-bold text-stone-900">
              ログインに使うメールアドレスは？
            </p>
            <input
              type="email"
              autoComplete="email"
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
              autoFocus
              className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            />
          </div>
        );
      case 10:
        return (
          <div className="space-y-4">
            <div>
              <p className="text-lg font-bold text-stone-900">
                ログイン用のパスワードを決めてください。
              </p>
              <p className="mt-2 text-sm text-stone-500">12文字以上</p>
              <input
                type="password"
                autoComplete="new-password"
                value={ownerPassword}
                onChange={(event) => setOwnerPassword(event.target.value)}
                autoFocus
                className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800">
                確認のためもう一度入力してください。
              </p>
              <input
                type="password"
                autoComplete="new-password"
                value={ownerPasswordConfirm}
                onChange={(event) => setOwnerPasswordConfirm(event.target.value)}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              />
            </div>
          </div>
        );
      default:
        return null;
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
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          一問一答で簡単登録
        </h1>
        <p className="mt-2 text-xs font-bold text-stone-500">
          質問 {step + 1} / {TOTAL_STEPS}
        </p>
      </Card>

      <Card className="space-y-4">
        {renderQuestion()}

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={goBack} disabled={isSubmitting}>
            戻る
          </Button>

          {isLastStep ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "登録しています..." : "登録してはじめる"}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={isSubmitting}>
              次へ
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
