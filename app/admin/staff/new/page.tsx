"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NewStaffPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [skills, setSkills] = useState("");
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!name.trim()) {
      setError("施術者名を入力してください。");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          label,
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
          active,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        setError(data?.error || "施術者の登録に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/staff");
      router.refresh();
    } catch {
      setError("施術者の登録に失敗しました。");
      setIsSubmitting(false);
    }
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link
          href="/admin/staff"
          className="text-sm font-bold text-stone-500"
        >
          ← 施術者管理
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            施術者登録
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            新しい施術者を登録します。
          </p>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="space-y-4">
            <div>
              <label
                htmlFor="staff-name"
                className="text-sm font-bold text-stone-700"
              >
                施術者名
              </label>

              <input
                id="staff-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例：AIKO"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <label
                htmlFor="staff-label"
                className="text-sm font-bold text-stone-700"
              >
                説明
              </label>

              <input
                id="staff-label"
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="例：強め・肩首"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <label
                htmlFor="staff-skills"
                className="text-sm font-bold text-stone-700"
              >
                得意分野
              </label>

              <input
                id="staff-skills"
                type="text"
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="例：肩こり, 首, 強め"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3">
              <div>
                <p className="font-bold text-stone-900">稼働状態</p>

                <p className="text-sm text-stone-500">
                  予約画面に表示するかを設定します。
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActive((current) => !current)}
                className={
                  active
                    ? "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
                }
              >
                {active ? "ON" : "OFF"}
              </button>
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
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
          </Card>
        </form>
      </div>
    </AdminFrame>
  );
}
