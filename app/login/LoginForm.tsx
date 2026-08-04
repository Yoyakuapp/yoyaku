"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function requestOtp(): Promise<boolean> {
    const response = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;

    if (!response.ok || !data?.ok) {
      setError(
        data?.error ?? "メールアドレスまたはパスワードが正しくありません。"
      );
      return false;
    }

    return true;
  }

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const ok = await requestOtp();

    setIsSubmitting(false);

    if (ok) {
      setOtp("");
      setStep("otp");
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      otp,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setError("確認コードが正しくないか、有効期限が切れています。");
      setIsSubmitting(false);
      return;
    }

    router.push(result.url || callbackUrl);
    router.refresh();
  }

  async function handleResend() {
    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const ok = await requestOtp();

    setIsSubmitting(false);

    if (ok) {
      setOtp("");
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit}>
        <Card className="space-y-5">
          <div>
            <p className="text-sm text-stone-600">
              {email} 宛に確認コードを送信しました。メールに記載の6桁のコードを入力してください。
            </p>
          </div>

          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-bold text-stone-800"
            >
              確認コード
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/[^0-9]/g, ""))
              }
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
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
            {isSubmitting ? "確認中..." : "ログイン"}
          </Button>

          <div className="flex items-center justify-between text-sm font-bold">
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError("");
              }}
              className="text-stone-500"
            >
              戻る
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting}
              className="text-green-800"
            >
              コードを再送信
            </button>
          </div>
        </Card>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit}>
      <Card className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-bold text-stone-800"
          >
            メールアドレス
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-stone-800"
          >
            パスワード
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          {isSubmitting ? "送信中..." : "確認コードを送信"}
        </Button>

        <Link
          href="/forgot-password"
          className="block text-center text-sm font-bold text-green-800"
        >
          パスワードをお忘れの方はこちら
        </Link>
      </Card>
    </form>
  );
}

