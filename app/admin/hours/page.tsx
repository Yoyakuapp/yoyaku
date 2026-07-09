"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const days = [
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
  "日曜日",
];

export default function AdminHoursPage() {
  const [closedDays, setClosedDays] = useState<string[]>(["日曜日"]);

  function toggleClosed(day: string) {
    if (closedDays.includes(day)) {
      setClosedDays(closedDays.filter((item) => item !== day));
    } else {
      setClosedDays([...closedDays, day]);
    }
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
            営業時間管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            曜日ごとの営業時間と休業日を設定します。
          </p>
        </Card>

        <div className="space-y-3">
          {days.map((day) => {
            const isClosed = closedDays.includes(day);

            return (
              <Card key={day} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-stone-900">
                    {day}
                  </h2>

                  <button
                    onClick={() => toggleClosed(day)}
                    className={
                      isClosed
                        ? "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
                        : "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                    }
                  >
                    {isClosed ? "休業" : "営業"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-sm font-bold text-stone-700">
                      開始
                    </p>
                    <input
                      defaultValue="10:00"
                      disabled={isClosed}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-bold text-stone-700">
                      終了
                    </p>
                    <input
                      defaultValue="20:00"
                      disabled={isClosed}
                      className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button>
          保存する
        </Button>
      </div>
    </MobileFrame>
  );
}