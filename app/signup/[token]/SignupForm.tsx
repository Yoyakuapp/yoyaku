"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type SignupFormProps = {
  token: string;
};

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function SignupForm({ token }: SignupFormProps) {
  const router = useRouter();

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
      setError("店舗名を入力してください。");
      return;
    }

    if (!slugPattern.test(normalizedSlug)) {
      setError(
        "URLに使う識別子は、半角小文字・数字・ハイフンのみで入力してください。"
      );
      return;
    }

    if (!normalizedOwnerName) {
      setError("お名前を入力してください。");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedOwnerEmail)) {
      setError("メールアドレスを正しく入力してください。");
      return;
    }

    if (ownerPassword.length < 12) {
      setError("パスワードは12文字以上で入力してください。");
      return;
    }

    if (ownerPassword !== ownerPasswordConfirm) {
      setError("パスワードが一致しません。");
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
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { slug?: string; error?: string }
        | null;

      if (!response.ok) {
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

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-5">
        <div>
          <label
            htmlFor="signup-store-name"
            className="block text-sm font-bold text-stone-800"
          >
            店舗名
          </label>

          <input
            id="signup-store-name"
            type="text"
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            placeholder="さくらマッサージ"
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            required
          />
        </div>

        <div>
          <label
            htmlFor="signup-slug"
            className="block text-sm font-bold text-stone-800"
          >
            公開URLに使う識別子
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

          <p className="mt-2 text-xs text-stone-500">
            半角小文字・数字・ハイフンのみ使用できます。
          </p>
        </div>

        <div>
          <label
            htmlFor="signup-owner-name"
            className="block text-sm font-bold text-stone-800"
          >
            お名前
          </label>

          <input
            id="signup-owner-name"
            type="text"
            autoComplete="name"
            value={ownerName}
            onChange={(event) => setOwnerName(event.target.value)}
            placeholder="山田 太郎"
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
            required
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="block text-sm font-bold text-stone-800"
          >
            メールアドレス
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

          <p className="mt-2 text-xs text-stone-500">
            ログイン時に使用します。
          </p>
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-bold text-stone-800"
          >
            パスワード
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

          <p className="mt-2 text-xs text-stone-500">12文字以上</p>
        </div>

        <div>
          <label
            htmlFor="signup-password-confirm"
            className="block text-sm font-bold text-stone-800"
          >
            パスワード(確認)
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
          {isSubmitting ? "登録しています..." : "登録してはじめる"}
        </Button>
      </Card>
    </form>
  );
}
