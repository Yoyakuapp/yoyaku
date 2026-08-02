"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TurnstileWidget from "@/components/turnstile/TurnstileWidget";

export default function ForgotPasswordForm() {
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
      setError("認証を完了してください。");
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
        setError(data?.error ?? "送信に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(data?.message ?? "ご案内をお送りしました。");
    } catch {
      setError("送信に失敗しました。");
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <Card className="space-y-4">
        <p className="text-sm font-bold text-green-800">{successMessage}</p>

        <Link href="/login" className="block">
          <Button variant="secondary">ログイン画面に戻る</Button>
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-5">
        <div>
          <label
            htmlFor="forgot-email"
            className="block text-sm font-bold text-stone-800"
          >
            メールアドレス
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信しています..." : "再設定メールを送る"}
        </Button>

        <Link
          href="/login"
          className="block text-center text-sm font-bold text-green-800"
        >
          ログイン画面に戻る
        </Link>
      </Card>
    </form>
  );
}
