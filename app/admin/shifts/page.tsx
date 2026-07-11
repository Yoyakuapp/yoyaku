"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Staff = {
  id: string;
  name: string;
  active: boolean;
};

type Shift = {
  staffId: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
};

type SavedShift = Shift & {
  id: string;
  date: string;
};

type WeeklyShiftMap = Record<string, Record<string, Shift>>;

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function startOfWeek(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  const day = date.getUTCDay();
  const distanceFromMonday = day === 0 ? 6 : day - 1;

  date.setUTCDate(date.getUTCDate() - distanceFromMonday);

  return date;
}

function formatShortDate(dateValue: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00.000Z`));
}

export default function ShiftsPage() {
  const today = formatDateKey(new Date());

  const [selectedDate, setSelectedDate] = useState(today);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Record<string, Shift>>({});
  const [weeklyShifts, setWeeklyShifts] = useState<WeeklyShiftMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isWeekLoading, setIsWeekLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const weekDates = useMemo(() => {
    const monday = startOfWeek(selectedDate);

    return Array.from({ length: 7 }, (_, index) =>
      formatDateKey(addDays(monday, index))
    );
  }, [selectedDate]);

  const loadStaff = useCallback(async () => {
    const response = await fetch("/api/staff", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("施術者情報の読み込みに失敗しました。");
    }

    const data = (await response.json()) as Staff[];

    return data.filter((person) => person.active);
  }, []);

  const loadSelectedDate = useCallback(
    async (staffData: Staff[]) => {
      const response = await fetch(
        `/api/shifts?date=${selectedDate}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("シフト情報の読み込みに失敗しました。");
      }

      const data = (await response.json()) as SavedShift[];
      const nextShifts: Record<string, Shift> = {};

      for (const person of staffData) {
        const existingShift = data.find(
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
    },
    [selectedDate]
  );

  const loadWeek = useCallback(async () => {
    setIsWeekLoading(true);

    const entries = await Promise.all(
      weekDates.map(async (date) => {
        const response = await fetch(`/api/shifts?date=${date}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("週間シフトの読み込みに失敗しました。");
        }

        const data = (await response.json()) as SavedShift[];
        const dayMap: Record<string, Shift> = {};

        for (const shift of data) {
          dayMap[shift.staffId] = {
            staffId: shift.staffId,
            startTime: shift.startTime,
            endTime: shift.endTime,
            isWorking: shift.isWorking,
          };
        }

        return [date, dayMap] as const;
      })
    );

    setWeeklyShifts(Object.fromEntries(entries));
    setIsWeekLoading(false);
  }, [weekDates]);

  useEffect(() => {
    async function loadPage() {
      setIsLoading(true);
      setMessage("");

      try {
        const staffData = await loadStaff();

        setStaff(staffData);

        await Promise.all([
          loadSelectedDate(staffData),
          loadWeek(),
        ]);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "シフト情報の読み込みに失敗しました。"
        );
      } finally {
        setIsLoading(false);
        setIsWeekLoading(false);
      }
    }

    loadPage();
  }, [loadSelectedDate, loadStaff, loadWeek]);

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
          date: `${selectedDate}T00:00:00.000Z`,
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

    await loadWeek();
  }

  function moveWeek(days: number) {
    const currentMonday = startOfWeek(selectedDate);
    const nextMonday = addDays(currentMonday, days);

    setSelectedDate(formatDateKey(nextMonday));
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link
          href="/admin"
          className="text-sm font-bold text-stone-500"
        >
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
            週間シフトの確認と、日ごとの勤務時間設定ができます。
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveWeek(-7)}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700"
            >
              ← 前週
            </button>

            <p className="text-center text-sm font-bold text-stone-800">
              {formatShortDate(weekDates[0])}
              〜
              {formatShortDate(weekDates[6])}
            </p>

            <button
              type="button"
              onClick={() => moveWeek(7)}
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700"
            >
              次週 →
            </button>
          </div>

          {isWeekLoading ? (
            <p className="text-center text-sm text-stone-500">
              週間シフトを読み込み中...
            </p>
          ) : staff.length === 0 ? (
            <p className="text-center text-sm text-stone-500">
              稼働中の施術者が登録されていません。
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-stone-200 bg-stone-100 px-3 py-3 text-left">
                      施術者
                    </th>

                    {weekDates.map((date) => (
                      <th
                        key={date}
                        className={
                          date === selectedDate
                            ? "border border-green-300 bg-green-50 px-3 py-3 text-center text-green-900"
                            : "border border-stone-200 bg-stone-100 px-3 py-3 text-center text-stone-700"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className="w-full font-bold"
                        >
                          {formatShortDate(date)}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {staff.map((person) => (
                    <tr key={person.id}>
                      <th className="border border-stone-200 bg-white px-3 py-3 text-left font-bold text-stone-900">
                        {person.name}
                      </th>

                      {weekDates.map((date) => {
                        const shift =
                          weeklyShifts[date]?.[person.id];

                        return (
                          <td
                            key={`${person.id}-${date}`}
                            className={
                              date === selectedDate
                                ? "border border-green-300 bg-green-50 px-2 py-3 text-center"
                                : "border border-stone-200 bg-white px-2 py-3 text-center"
                            }
                          >
                            {!shift ? (
                              <button
                                type="button"
                                onClick={() => setSelectedDate(date)}
                                className="w-full rounded-lg bg-amber-50 px-2 py-2 text-xs font-bold text-amber-700"
                              >
                                未設定
                              </button>
                            ) : shift.isWorking ? (
                              <button
                                type="button"
                                onClick={() => setSelectedDate(date)}
                                className="w-full rounded-lg bg-green-100 px-2 py-2 text-xs font-bold text-green-800"
                              >
                                {shift.startTime}
                                <br />
                                〜{shift.endTime}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedDate(date)}
                                className="w-full rounded-lg bg-stone-100 px-2 py-2 text-xs font-bold text-stone-500"
                              >
                                休み
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <label
            htmlFor="shift-date"
            className="text-sm font-bold text-stone-700"
          >
            編集する日付
          </label>

          <input
            id="shift-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
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
              稼働中の施術者が登録されていません。
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