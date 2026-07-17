"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Holiday = {
  id: string;
  date: string;
  reason: string;
};

export default function AdminHolidaysPage() {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadHolidays() {
      const response = await fetch("/api/holidays", {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage("休業日の読み込みに失敗しました。");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as Holiday[];

      setHolidays(data);
      setIsLoading(false);
    }

    loadHolidays();
  }, []);

  async function addHoliday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || isSubmitting) {
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/holidays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: `${date}T00:00:00.000Z`,
        reason: reason.trim() || "休業日",
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      setMessage(body?.error || "休業日の追加に失敗しました。");
      setIsSubmitting(false);
      return;
    }

    const holiday = (await response.json()) as Holiday;

    setHolidays((current) =>
      [...current, holiday].sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );

    setDate("");
    setReason("");
    setMessage("休業日を追加しました。");
    setIsSubmitting(false);
  }

  async function deleteHoliday(id: string) {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      "この休業日を削除します。よろしいですか？"
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setDeletingId(id);

    const response = await fetch(`/api/holidays/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("休業日の削除に失敗しました。");
      setDeletingId("");
      return;
    }

    setHolidays((current) =>
      current.filter((holiday) => holiday.id !== id)
    );

    setMessage("休業日を削除しました。");
    setDeletingId("");
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(new Date(value));
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">
            Yoyaku Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            休業日管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            臨時休業日・特別休業日を設定します。
          </p>
        </Card>

        <form onSubmit={addHoliday}>
          <Card className="space-y-4">
            <div>
              <label
                htmlFor="holiday-date"
                className="text-sm font-bold text-stone-700"
              >
                休業日
              </label>

              <input
                id="holiday-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <label
                htmlFor="holiday-reason"
                className="text-sm font-bold text-stone-700"
              >
                理由
              </label>

              <input
                id="holiday-reason"
                type="text"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="例：臨時休業"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "追加中..." : "休業日を追加"}
            </Button>
          </Card>
        </form>

        {message ? (
          <Card>
            <p
              className={
                message.includes("失敗")
                  ? "text-sm font-bold text-red-700"
                  : "text-sm font-bold text-green-800"
              }
            >
              {message}
            </p>
          </Card>
        ) : null}

        {isLoading ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              読み込み中...
            </p>
          </Card>
        ) : holidays.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              休業日はまだ登録されていません。
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <Card key={holiday.id} className="space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {formatDate(holiday.date)}
                  </h2>

                  <p className="text-sm text-stone-500">
                    {holiday.reason}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteHoliday(holiday.id)}
                  disabled={Boolean(deletingId)}
                  className="w-full rounded-2xl border border-red-300 py-2.5 font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === holiday.id ? "削除中..." : "削除"}
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminFrame>
  );
}