"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Holiday = {
  id: number;
  date: string;
  reason: string;
};

export default function AdminHolidaysPage() {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([
    {
      id: 1,
      date: "2026-07-15",
      reason: "臨時休業",
    },
  ]);

  function addHoliday() {
    if (!date) return;

    setHolidays([
      ...holidays,
      {
        id: Date.now(),
        date,
        reason: reason || "休業日",
      },
    ]);

    setDate("");
    setReason("");
  }

  function deleteHoliday(id: number) {
    setHolidays(holidays.filter((holiday) => holiday.id !== id));
  }

  return (
    <MobileFrame>
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

        <Card className="space-y-4">
          <div>
            <label className="text-sm font-bold text-stone-700">
              休業日
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              理由
            </label>

            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="例：臨時休業"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <Button onClick={addHoliday}>
            休業日を追加
          </Button>
        </Card>

        <div className="space-y-3">
          {holidays.map((holiday) => (
            <Card key={holiday.id} className="space-y-3">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {holiday.date}
                </h2>

                <p className="text-sm text-stone-500">
                  {holiday.reason}
                </p>
              </div>

              <button
                onClick={() => deleteHoliday(holiday.id)}
                className="w-full rounded-2xl border border-red-300 py-2.5 font-bold text-red-600"
              >
                削除
              </button>
            </Card>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}