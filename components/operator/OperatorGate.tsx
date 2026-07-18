"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const OPERATOR_PASSWORD_STORAGE_KEY = "yoyaku-operator-password";

type OperatorGateProps = {
  children: (password: string) => ReactNode;
};

export default function OperatorGate({ children }: OperatorGateProps) {
  const [password, setPassword] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (sessionStorage.getItem(OPERATOR_PASSWORD_STORAGE_KEY) ?? "")
  );
  const [isAuthed, setIsAuthed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (password) {
      void verify(password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(candidate: string) {
    setIsChecking(true);
    setError("");

    try {
      const response = await fetch(
        `/api/operator/verify?password=${encodeURIComponent(candidate)}`
      );

      if (!response.ok) {
        setIsAuthed(false);
        sessionStorage.removeItem(OPERATOR_PASSWORD_STORAGE_KEY);
        setError("パスワードが正しくありません。");
        return;
      }

      setIsAuthed(true);
      sessionStorage.setItem(OPERATOR_PASSWORD_STORAGE_KEY, candidate);
    } catch {
      setError("確認に失敗しました。");
    } finally {
      setIsChecking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void verify(password);
  }

  function handleLogout() {
    sessionStorage.removeItem(OPERATOR_PASSWORD_STORAGE_KEY);
    setPassword("");
    setIsAuthed(false);
  }

  if (!isAuthed) {
    return (
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-sm font-bold tracking-widest text-green-800">
            Yoyakus
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            運営者ページ
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            運営者用パスワードを入力してください。
          </p>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="パスワード"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
              required
            />

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={isChecking}>
              {isChecking ? "確認しています..." : "入る"}
            </Button>
          </Card>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-bold text-stone-400"
        >
          ログアウト
        </button>
      </div>

      {children(password)}
    </div>
  );
}
