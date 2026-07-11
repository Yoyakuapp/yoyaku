"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Staff = {
  id: string;
  name: string;
};

type Shift = {
  staffId: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
};

export default function ShiftsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Record<string, Shift>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setMessage("");

      const staffResponse = await fetch("/api/staff", {
        cache: "no-store",
      });

      if (!staffResponse.ok) {
        setMessage("施術者情報の読み込みに失敗しました。");
        setIsLoading(false);
        return;
      }

      const staffData = (await staffResponse.json()) as Staff[];
      setStaff(staffData);

      const shiftResponse = await fetch(`/api/shifts?date=${date}`, {
        cache: "no-store",
      });

      if (!shiftResponse.ok) {
        setMessage("シフト情報の読み込みに失敗しました。");
        setIsLoading(false);
        return;
      }

      const shiftData = (await shiftResponse.json()) as Array<
        Shift & {
          id: string;
        }
      >;

      const nextShifts: Record<string, Shift> = {};

      for (const person of staffData) {
        const existingShift = shiftData.find(
          (shift) => shift.staffId === person.id
        );

        nextShifts[person.id] = existingShift
          ? {
              staffId: existingShift.staffId,
              startTime: existingShift.startTime,
              endTime: existingShift.endTime,
              isWorking: existingShift.isWorking,
            }
          : {
              staffId: person.id,
              startTime: "10:00",
              endTime: "20:00",
              isWorking: true,
            };
      }

      setShifts(nextShifts);
      setIsLoading(false);
    }

    load();
  }, [date]);

  function updateShift(
    staffId: string,
    field: "startTime" | "endTime" | "isWorking",
    value: string | boolean
  ) {
    setShifts((current) => {
      const currentShift = current[staffId] ?? {
        staffId,
        startTime: "10:00",
        endTime: "20:00",
        isWorking: true,
      };

      return {
        ...current,
        [staffId]: {
          ...currentShift,
          [field]: value,
        },
      };
    });
  }

  async function saveShifts() {
    if (isSaving) {
      return;
    }

    setMessage("");
    setIsSaving(true);

    const response = await fetch("/api/shifts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shifts: Object.values(shifts).map((shift) => ({
          staffId: shift.staffId,
          date: `${date}T00:00:00.000Z`,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isWorking: shift.isWorking,
        })),
      }),
    });

    if (!response.ok) {
      setMessage("シフトの保存に失敗しました。");
      setIsSaving(false);
      return;
    }

    setMessage("シフトを保存しました。");
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
            シフト管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            施術者ごとの出勤時間と休みを設定します。
          </p>
        </Card>

        <Card>
          <label
            htmlFor="shift-date"
            className="text-sm font-bold text-stone-700"
          >
            日付
          </label>

          <input
            id="shift-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />
        </Card>

        {isLoading ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              読み込み中...
            </p>
          </Card>
        ) : staff.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              施術者が登録されていません。
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {staff.map((person) => {
              const shift = shifts[person.id] ?? {
                staffId: person.id,
                startTime: "10:00",
                endTime: "20:00",
                isWorking: true,
              };

              return (
                <Card key={person.id} className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-stone-900">
                        {person.name}
                      </h2>

                      <p className="text-sm text-stone-500">
                        {shift.isWorking ? "勤務予定" : "休み"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateShift(
                          person.id,
                          "isWorking",
                          !shift.isWorking
                        )
                      }
                      className={
                        shift.isWorking
                          ? "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                          : "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
                      }
                    >
                      {shift.isWorking ? "勤務" : "休み"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor={`shift-start-${person.id}`}
                        className="mb-2 block text-sm font-bold text-stone-700"
                      >
                        開始
                      </label>

                      <input
                        id={`shift-start-${person.id}`}
                        type="time"
                        value={shift.startTime}
                        disabled={!shift.isWorking}
                        onChange={(event) =>
                          updateShift(
                            person.id,
                            "startTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`shift-end-${person.id}`}
                        className="mb-2 block text-sm font-bold text-stone-700"
                      >
                        終了
                      </label>

                      <input
                        id={`shift-end-${person.id}`}
                        type="time"
                        value={shift.endTime}
                        disabled={!shift.isWorking}
                        onChange={(event) =>
                          updateShift(
                            person.id,
                            "endTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

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

        <Button
          onClick={saveShifts}
          disabled={isLoading || isSaving || staff.length === 0}
        >
          {isSaving ? "保存中..." : "保存する"}
        </Button>
      </div>
    </MobileFrame>
  );
}