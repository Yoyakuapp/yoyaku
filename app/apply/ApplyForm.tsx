"use client";

import { FormEvent, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TurnstileWidget from "@/components/turnstile/TurnstileWidget";

export default function ApplyForm() {
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
      setError("認証を完了してください。");
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
        setError(data?.error ?? "お申し込みに失敗しました。");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        data?.message ?? "お申し込みを受け付けました。"
      );
    } catch {
      setError("お申し込みに失敗しました。");
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <Card>
        <p className="text-sm font-bold text-green-800">{successMessage}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-5">
        <div>
          <label
            htmlFor="apply-store-name"
            className="block text-sm font-bold text-stone-800"
          >
            店舗名
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
            ご担当者名
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
            メールアドレス
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
          <p className="mt-1 text-xs text-stone-400">
            このメールアドレス宛に登録用のご案内をお送りします。
          </p>
        </div>

        <div>
          <label
            htmlFor="apply-phone"
            className="block text-sm font-bold text-stone-800"
          >
            電話番号(任意)
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
            ご要望・メモ(任意)
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信しています..." : "お申し込みを送信"}
        </Button>
      </Card>
    </form>
  );
}
