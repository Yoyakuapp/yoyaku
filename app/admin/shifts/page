"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const staff = ["AIKO", "EMI", "YUNA"];

export default function ShiftsPage() {
  const [date, setDate] = useState("2026-07-09");

  const times = Array.from({ length: 21 }, (_, index) => {
    const totalMinutes = 10 * 60 + index * 30;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  });

  function isWorking(time: string, name: string) {
    if (name === "AIKO") return time < "18:00";
    if (name === "EMI") return time >= "10:30" && time < "20:00";
    if (name === "YUNA") return time >= "11:00" && time < "19:00";
    return false;
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <h1 className="text-3xl font-bold text-stone-900">
            出勤表管理
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            施術者の出勤時間を設定します。
          </p>
        </Card>

        <Card>
          <label className="text-sm font-bold text-stone-700">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-4 bg-stone-100 text-center text-sm font-bold text-stone-700">
            <div className="py-3">時間</div>
            {staff.map((name) => (
              <div key={name} className="py-3">
                {name}
              </div>
            ))}
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {times.map((time) => (
              <div
                key={time}
                className="grid grid-cols-4 border-t border-stone-200 text-center"
              >
                <div className="py-4 text-sm font-bold text-stone-600">
                  {time}
                </div>

                {staff.map((name) => {
                  const working = isWorking(time, name);

                  return (
                    <button
                      key={name}
                      className={
                        working
                          ? "m-2 rounded-xl bg-green-800 py-3 font-bold text-white"
                          : "m-2 rounded-xl bg-stone-100 py-3 font-bold text-stone-300"
                      }
                    >
                      {working ? "出" : "休"}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        <Button>保存する</Button>

        <Card>
          <p className="text-sm text-stone-500">
            ※ この出勤表が、次の段階で空き状況画面と連動します。
          </p>
        </Card>
      </div>
    </MobileFrame>
  );
}