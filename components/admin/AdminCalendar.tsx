"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type CalendarDayShift = {
  staffId: string;
  staffName: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
};

type CalendarDay = {
  date: string;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isClosed: boolean;
  closedReason: string | null;
  openTime: string | null;
  closeTime: string | null;
  isOverride: boolean;
  shifts: CalendarDayShift[];
};

type MonthCalendar = {
  days: CalendarDay[];
  staff: {
    id: string;
    name: string;
  }[];
};

type EditorShift = {
  staffId: string;
  staffName: string;
  startTime: string;
  endTime: string;
  isWorking: boolean;
};

const dayOfWeekLabels = ["月", "火", "水", "木", "金", "土", "日"];

function getCurrentMonthValue() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function addMonths(monthValue: string, count: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + count, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);

  return `${year}年${month}月`;
}

function formatDayLabel(dateValue: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00.000Z`));
}

export default function AdminCalendar() {
  const [monthValue, setMonthValue] = useState(getCurrentMonthValue());
  const [calendar, setCalendar] = useState<MonthCalendar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editorIsClosed, setEditorIsClosed] = useState(false);
  const [editorClosedReason, setEditorClosedReason] = useState("");
  const [editorOpenTime, setEditorOpenTime] = useState("10:00");
  const [editorCloseTime, setEditorCloseTime] = useState("20:00");
  const [editorShifts, setEditorShifts] = useState<EditorShift[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveMessageIsError, setSaveMessageIsError] = useState(false);

  const loadMonth = useCallback(async (month: string) => {
    setIsLoading(true);
    setLoadError("");

    const response = await fetch(`/api/admin/calendar?month=${month}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      setLoadError("カレンダーの読み込みに失敗しました。");
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as MonthCalendar;

    setCalendar(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    async function run() {
      await loadMonth(monthValue);
      setSelectedDate(null);
    }

    run();
  }, [monthValue, loadMonth]);

  const weeks = useMemo(() => {
    if (!calendar) {
      return [];
    }

    const rows: CalendarDay[][] = [];

    for (let index = 0; index < calendar.days.length; index += 7) {
      rows.push(calendar.days.slice(index, index + 7));
    }

    return rows;
  }, [calendar]);

  function selectDay(day: CalendarDay) {
    if (!calendar) {
      return;
    }

    setSelectedDate(day.date);
    setSaveMessage("");
    setEditorIsClosed(day.isClosed);
    setEditorClosedReason(day.closedReason ?? "");
    setEditorOpenTime(day.openTime ?? "10:00");
    setEditorCloseTime(day.closeTime ?? "20:00");

    setEditorShifts(
      calendar.staff.map((person) => {
        const existing = day.shifts.find(
          (shift) => shift.staffId === person.id
        );

        return {
          staffId: person.id,
          staffName: person.name,
          startTime: existing?.startTime ?? "10:00",
          endTime: existing?.endTime ?? "20:00",
          isWorking: existing?.isWorking ?? false,
        };
      })
    );
  }

  function updateEditorShift(
    staffId: string,
    field: "startTime" | "endTime" | "isWorking",
    value: string | boolean
  ) {
    setEditorShifts((current) =>
      current.map((shift) =>
        shift.staffId === staffId
          ? {
              ...shift,
              [field]: value,
            }
          : shift
      )
    );
  }

  async function saveDay() {
    if (!selectedDate || isSaving) {
      return;
    }

    setSaveMessage("");
    setIsSaving(true);

    const response = await fetch("/api/admin/calendar/day", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: selectedDate,
        isClosed: editorIsClosed,
        closedReason: editorClosedReason,
        openTime: editorOpenTime,
        closeTime: editorCloseTime,
        shifts: editorShifts.map((shift) => ({
          staffId: shift.staffId,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isWorking: shift.isWorking,
        })),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      setSaveMessage(body?.error ?? "保存に失敗しました。");
      setSaveMessageIsError(true);
      setIsSaving(false);
      return;
    }

    setSaveMessage("保存しました。");
    setSaveMessageIsError(false);
    setIsSaving(false);

    await loadMonth(monthValue);
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-stone-900">
          営業日＆出勤カレンダー
        </h2>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setMonthValue((current) => addMonths(current, -1))}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700"
        >
          ← 前月
        </button>

        <p className="text-center text-sm font-bold text-stone-800">
          {formatMonthLabel(monthValue)}
        </p>

        <button
          type="button"
          onClick={() => setMonthValue((current) => addMonths(current, 1))}
          className="rounded-xl border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700"
        >
          次月 →
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-stone-500">
          読み込み中...
        </p>
      ) : loadError ? (
        <p className="text-center text-sm font-bold text-red-700">
          {loadError}
        </p>
      ) : calendar ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-xs md:text-sm">
            <thead>
              <tr>
                {dayOfWeekLabels.map((label) => (
                  <th
                    key={label}
                    className="border border-stone-200 bg-stone-100 py-2 text-center font-bold text-stone-600 md:py-3"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {weeks.map((week) => (
                <tr key={week[0]?.date}>
                  {week.map((day) => {
                    const workingShifts = day.shifts.filter(
                      (shift) => shift.isWorking
                    );
                    const staffSummary =
                      workingShifts.length > 2
                        ? `${workingShifts
                            .slice(0, 2)
                            .map((shift) => shift.staffName)
                            .join("・")} 他`
                        : workingShifts
                            .map((shift) => shift.staffName)
                            .join("・");

                    return (
                      <td
                        key={day.date}
                        className={
                          day.date === selectedDate
                            ? "border border-green-400 bg-green-50 p-0 align-top"
                            : "border border-stone-200 bg-white p-0 align-top"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => selectDay(day)}
                          className={`flex h-full w-full flex-col gap-1 px-1.5 py-2 text-left md:min-h-[92px] md:gap-1.5 md:px-3 md:py-3 ${
                            day.isCurrentMonth ? "" : "opacity-40"
                          }`}
                        >
                          <span
                            className={
                              day.isToday
                                ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-800 font-bold text-white md:h-6 md:w-6"
                                : "font-bold text-stone-700"
                            }
                          >
                            {Number(day.date.slice(-2))}
                          </span>

                          {day.isClosed ? (
                            <span className="rounded bg-stone-200 px-1 py-0.5 text-center font-bold text-stone-500">
                              休
                            </span>
                          ) : (
                            <span className="text-[10px] leading-tight text-stone-500 md:text-xs">
                              {day.openTime}〜{day.closeTime}
                              {day.isOverride ? "＊" : ""}
                            </span>
                          )}

                          {workingShifts.length > 0 ? (
                            <span className="text-[10px] leading-tight text-green-800 md:text-xs">
                              {staffSummary}
                            </span>
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-2 text-[11px] text-stone-400">
            ＊は通常と異なる営業時間が設定されている日です。マスをタップすると編集できます。
          </p>
        </div>
      ) : null}

      {selectedDate ? (
        <div className="space-y-4 border-t border-stone-200 pt-4">
          <p className="text-lg font-bold text-stone-900">
            {formatDayLabel(selectedDate)}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditorIsClosed(false)}
              className={
                !editorIsClosed
                  ? "flex-1 rounded-xl bg-green-800 py-2 text-sm font-bold text-white"
                  : "flex-1 rounded-xl border border-stone-200 bg-white py-2 text-sm font-bold text-stone-600"
              }
            >
              営業
            </button>

            <button
              type="button"
              onClick={() => setEditorIsClosed(true)}
              className={
                editorIsClosed
                  ? "flex-1 rounded-xl bg-stone-700 py-2 text-sm font-bold text-white"
                  : "flex-1 rounded-xl border border-stone-200 bg-white py-2 text-sm font-bold text-stone-600"
              }
            >
              休業
            </button>
          </div>

          {editorIsClosed ? (
            <div>
              <label
                htmlFor="calendar-closed-reason"
                className="mb-2 block text-sm font-bold text-stone-700"
              >
                休業理由
              </label>

              <input
                id="calendar-closed-reason"
                type="text"
                value={editorClosedReason}
                onChange={(event) =>
                  setEditorClosedReason(event.target.value)
                }
                placeholder="臨時休業"
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="calendar-open-time"
                  className="mb-2 block text-sm font-bold text-stone-700"
                >
                  営業開始
                </label>

                <input
                  id="calendar-open-time"
                  type="time"
                  value={editorOpenTime}
                  onChange={(event) => setEditorOpenTime(event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                />
              </div>

              <div>
                <label
                  htmlFor="calendar-close-time"
                  className="mb-2 block text-sm font-bold text-stone-700"
                >
                  営業終了
                </label>

                <input
                  id="calendar-close-time"
                  type="time"
                  value={editorCloseTime}
                  onChange={(event) => setEditorCloseTime(event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-bold text-stone-700">施術者の出勤</p>

            {editorShifts.length === 0 ? (
              <p className="text-sm text-stone-500">
                稼働中の施術者が登録されていません。
              </p>
            ) : (
              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                {editorShifts.map((shift) => (
                <div
                  key={shift.staffId}
                  className="rounded-2xl border border-stone-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-stone-900">
                      {shift.staffName}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        updateEditorShift(
                          shift.staffId,
                          "isWorking",
                          !shift.isWorking
                        )
                      }
                      className={
                        shift.isWorking
                          ? "rounded-full bg-green-800 px-3 py-1 text-xs font-bold text-white"
                          : "rounded-full bg-stone-200 px-3 py-1 text-xs font-bold text-stone-600"
                      }
                    >
                      {shift.isWorking ? "出勤" : "休み"}
                    </button>
                  </div>

                  {shift.isWorking ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        aria-label={`${shift.staffName}の出勤開始`}
                        value={shift.startTime}
                        onChange={(event) =>
                          updateEditorShift(
                            shift.staffId,
                            "startTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900"
                      />

                      <input
                        type="time"
                        aria-label={`${shift.staffName}の出勤終了`}
                        value={shift.endTime}
                        onChange={(event) =>
                          updateEditorShift(
                            shift.staffId,
                            "endTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-900"
                      />
                    </div>
                  ) : null}
                </div>
                ))}
              </div>
            )}
          </div>

          {saveMessage ? (
            <p
              className={
                saveMessageIsError
                  ? "text-sm font-bold text-red-700"
                  : "text-sm font-bold text-green-800"
              }
            >
              {saveMessage}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button onClick={saveDay} disabled={isSaving}>
              {isSaving ? "保存中..." : "この日を保存"}
            </Button>

            <Button variant="secondary" onClick={() => setSelectedDate(null)}>
              閉じる
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
