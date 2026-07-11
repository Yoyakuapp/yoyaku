"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type BusinessHour = {
  id?: string;
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
};

const dayLabels = [
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
  "日曜日",
];

export default function AdminHoursPage() {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadHours() {
      const response = await fetch("/api/business-hours", {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage("営業時間の読み込みに失敗しました。");
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as BusinessHour[];

      setHours(data);
      setIsLoading(false);
    }

    loadHours();
  }, []);

  function updateHour(
    dayOfWeek: number,
    field: "isClosed" | "openTime" | "closeTime",
    value: boolean | string
  ) {
    setHours((currentHours) =>
      currentHours.map((hour) =>
        hour.dayOfWeek === dayOfWeek
          ? {
              ...hour,
              [field]: value,
            }
          : hour
      )
    );
  }

  async function saveHours() {
    if (isSaving) {
      return;
    }

    setMessage("");
    setIsSaving(true);

    const response = await fetch("/api/business-hours", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hours: hours.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          isClosed: hour.isClosed,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        })),
      }),
    });

    if (!response.ok) {
      setMessage("営業時間の保存に失敗しました。");
      setIsSaving(false);
      return;
    }

    const data = (await response.json()) as BusinessHour[];

    setHours(data);
    setMessage("営業時間を保存しました。");
    setIsSaving(false);
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

        {isLoading ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              読み込み中...
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {hours.map((hour) => (
                <Card key={hour.dayOfWeek} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-stone-900">
                      {dayLabels[hour.dayOfWeek]}
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        updateHour(
                          hour.dayOfWeek,
                          "isClosed",
                          !hour.isClosed
                        )
                      }
                      className={
                        hour.isClosed
                          ? "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
                          : "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                      }
                    >
                      {hour.isClosed ? "休業" : "営業"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor={`open-${hour.dayOfWeek}`}
                        className="mb-2 block text-sm font-bold text-stone-700"
                      >
                        開始
                      </label>

                      <input
                        id={`open-${hour.dayOfWeek}`}
                        type="time"
                        value={hour.openTime}
                        disabled={hour.isClosed}
                        onChange={(event) =>
                          updateHour(
                            hour.dayOfWeek,
                            "openTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`close-${hour.dayOfWeek}`}
                        className="mb-2 block text-sm font-bold text-stone-700"
                      >
                        終了
                      </label>

                      <input
                        id={`close-${hour.dayOfWeek}`}
                        type="time"
                        value={hour.closeTime}
                        disabled={hour.isClosed}
                        onChange={(event) =>
                          updateHour(
                            hour.dayOfWeek,
                            "closeTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

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

            <Button onClick={saveHours} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存する"}
            </Button>
          </>
        )}
      </div>
    </MobileFrame>
  );
}