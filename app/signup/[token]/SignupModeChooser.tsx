"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SignupForm from "./SignupForm";
import SignupWizard from "./SignupWizard";

type SignupModeChooserProps = {
  token: string;
};

type Mode = "choice" | "form" | "wizard";

export default function SignupModeChooser({ token }: SignupModeChooserProps) {
  const [mode, setMode] = useState<Mode>("choice");

  if (mode === "form") {
    return <SignupForm token={token} onBack={() => setMode("choice")} />;
  }

  if (mode === "wizard") {
    return <SignupWizard token={token} onBack={() => setMode("choice")} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">店舗登録</h1>
        <p className="mt-2 text-sm text-stone-500">
          登録方法を選んでください。どちらも同じ内容を登録できます。
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">
          一問一答で簡単登録
        </h2>
        <p className="text-sm text-stone-500">
          ひとつずつ質問に答えていく形式です。入力に不慣れな方におすすめです。
        </p>
        <Button onClick={() => setMode("wizard")}>
          一問一答で簡単登録をはじめる
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">フォームに入力</h2>
        <p className="text-sm text-stone-500">
          必要な項目を1画面にまとめて入力する形式です。
        </p>
        <Button variant="secondary" onClick={() => setMode("form")}>
          フォームに入力する
        </Button>
      </Card>
    </div>
  );
}
