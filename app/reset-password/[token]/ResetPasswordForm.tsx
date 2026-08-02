"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (password.length < 12) {
      setError("パスワードは12文字以上で入力してください。");
      return;
    }

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません。");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "再設定に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(data?.message ?? "パスワードを再設定しました。");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("再設定に失敗しました。");
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
            htmlFor="reset-password"
            className="block text-sm font-bold text-stone-800"
          >
            新しいパスワード
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            required
          />
          <p className="mt-1 text-xs text-stone-400">12文字以上</p>
        </div>

        <div>
          <label
            htmlFor="reset-password-confirm"
            className="block text-sm font-bold text-stone-800"
          >
            新しいパスワード(確認)
          </label>
          <input
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
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
          {isSubmitting ? "設定しています..." : "パスワードを再設定"}
        </Button>
      </Card>
    </form>
  );
}
