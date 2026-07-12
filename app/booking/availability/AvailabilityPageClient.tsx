"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Staff = {
  id: string;
  name: string;
};

type AvailabilitySlot = {
  time: string;
  availableStaff: Staff[];
  groups: Staff[][];
};

type AvailabilityResponse = {
  date: string;
  duration: number;
  people: number;
  staff: string | null;
  isClosed: boolean;
  closedReason: string | null;
  openTime: string | null;
  closeTime: string | null;
  slots: AvailabilitySlot[];
  error?: string;
};

type ViewMode = "list" | "table";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateValue}T00:00:00.000Z`));
}

export default function AvailabilityPage() {
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const menuId = searchParams.get("menuId") || "";
  const duration = Number(searchParams.get("duration") || 60);
  const people = Number(searchParams.get("people") || 1);
  const requestedStaff = searchParams.get("staff") || "";

  const initialDate =
    searchParams.get("date") ||
    (/^\d{4}-\d{2}-\d{2}$/.test(when) ? when : getTodayDate());

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [availability, setAvailability] =
    useState<AvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({
        date: selectedDate,
        duration: String(duration),
        people: String(people),
      });

      if (menuId) {
        params.set("menuId", menuId);
      }

      if (requestedStaff) {
        params.set("staff", requestedStaff);
      }

      try {
        const response = await fetch(
          `/api/availability?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = (await response.json()) as AvailabilityResponse;

        if (!response.ok) {
          setAvailability(null);
          setError(data.error || "空き時間の取得に失敗しました。");
          return;
        }

        setAvailability(data);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        setAvailability(null);
        setError("空き時間の取得に失敗しました。");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      controller.abort();
    };
  }, [duration, menuId, people, requestedStaff, selectedDate]);

  const allStaff = useMemo(() => {
    const staffMap = new Map<string, Staff>();

    for (const slot of availability?.slots ?? []) {
      for (const staff of slot.availableStaff) {
        staffMap.set(staff.id, staff);
      }
    }

    return Array.from(staffMap.values());
  }, [availability]);

  const firstAvailableSlot = availability?.slots[0] ?? null;

  function buildConfirmUrl(time: string, group: Staff[]) {
    const staffNames = group.map((staff) => staff.name).join(" + ");

    const params = new URLSearchParams({
      when: selectedDate,
      date: selectedDate,
      duration: String(duration),
      people: String(people),
      time,
      staff: staffNames,
    });

    if (menuId) {
      params.set("menuId", menuId);
    }

    return `/booking/confirm?${params.toString()}`;
  }

  function statusLabel(groupCount: number) {
    if (groupCount >= 3) {
      return "◎ 空きあり";
    }

    if (groupCount === 2) {
      return "○ 予約可";
    }

    return "△ 残り1枠";
  }

  function statusClass(groupCount: number) {
    if (groupCount >= 3) {
      return "bg-green-800 text-white";
    }

    if (groupCount === 2) {
      return "bg-green-700 text-white";
    }

    return "bg-amber-500 text-white";
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/booking"
            className="text-sm font-bold text-stone-500"
          >
            ← 条件変更
          </Link>

          <p className="text-right text-sm font-bold text-green-800">
            {duration}分・{people}人
          </p>
        </div>

        <Card className="space-y-4">
          <div>
            <p className="text-sm font-bold text-green-800">
              Sakura Thai Massage
            </p>

            <h1 className="mt-1 text-3xl font-bold text-stone-900">
              空き時間
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              営業時間、休業日、シフト、既存予約をもとに表示しています。
            </p>
          </div>

          <div>
            <label
              htmlFor="availability-date"
              className="text-sm font-bold text-stone-700"
            >
              予約日
            </label>

            <input
              id="availability-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />

            <p className="mt-2 text-sm text-stone-500">
              {formatDate(selectedDate)}
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-3xl bg-stone-100 p-5">
              <p className="font-bold text-stone-800">
                空き時間を確認しています...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-red-50 p-5">
              <p className="font-bold text-red-700">{error}</p>
            </div>
          ) : availability?.isClosed ? (
            <div className="rounded-3xl bg-stone-100 p-5">
              <p className="font-bold text-stone-800">
                この日は休業日です。
              </p>

              <p className="mt-1 text-sm text-stone-500">
                {availability.closedReason || "休業日"}
              </p>
            </div>
          ) : firstAvailableSlot ? (
            <div className="rounded-3xl bg-gradient-to-br from-green-900 to-green-700 p-5 text-white">
              <p className="text-sm text-white/70">
                最短で予約できます
              </p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-bold">
                    {firstAvailableSlot.time}
                  </p>

                  <p className="mt-1 text-sm text-white/80">
                    {firstAvailableSlot.groups[0]
                      ?.map((staff) => staff.name)
                      .join(" + ")}
                  </p>
                </div>

                {firstAvailableSlot.groups[0] ? (
                  <Link
                    href={buildConfirmUrl(
                      firstAvailableSlot.time,
                      firstAvailableSlot.groups[0]
                    )}
                    className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-800"
                  >
                    選択
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-stone-100 p-5">
              <p className="font-bold text-stone-800">
                条件に合う空き時間がありません。
              </p>

              <p className="mt-1 text-sm text-stone-500">
                日付、時間、人数を変更してください。
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 rounded-2xl bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={
                viewMode === "list"
                  ? "rounded-xl bg-white py-2 font-bold text-green-800 shadow-sm"
                  : "py-2 font-bold text-stone-500"
              }
            >
              リスト
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={
                viewMode === "table"
                  ? "rounded-xl bg-white py-2 font-bold text-green-800 shadow-sm"
                  : "py-2 font-bold text-stone-500"
              }
            >
              表
            </button>
          </div>
        </Card>

        {!isLoading &&
        !error &&
        availability &&
        !availability.isClosed &&
        viewMode === "list" ? (
          availability.slots.length === 0 ? null : (
            <div className="space-y-3">
              {availability.slots.map((slot) => (
                <Card key={slot.time} className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl font-bold text-stone-900">
                        {slot.time}
                      </p>

                      <p className="mt-1 text-sm text-stone-500">
                        {slot.groups.length}通りの組み合わせ
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-bold ${statusClass(
                        slot.groups.length
                      )}`}
                    >
                      {statusLabel(slot.groups.length)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {slot.groups.slice(0, 4).map((group) => {
                      const staffNames = group
                        .map((staff) => staff.name)
                        .join(" + ");

                      return (
                        <Link
                          key={`${slot.time}-${staffNames}`}
                          href={buildConfirmUrl(slot.time, group)}
                          className="block rounded-2xl bg-green-800 px-4 py-3 text-sm font-bold text-white"
                        >
                          {staffNames}
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : null}

        {!isLoading &&
        !error &&
        availability &&
        !availability.isClosed &&
        viewMode === "table" ? (
          allStaff.length === 0 ? null : (
            <Card className="overflow-hidden p-0">
              <div
                className="grid bg-stone-100 text-center text-sm font-bold text-stone-700"
                style={{
                  gridTemplateColumns: `100px repeat(${allStaff.length}, minmax(90px, 1fr))`,
                }}
              >
                <div className="py-3">時間</div>

                {allStaff.map((staff) => (
                  <div key={staff.id} className="py-3">
                    {staff.name}
                  </div>
                ))}
              </div>

              <div className="max-h-[560px] overflow-auto">
                {availability.slots.map((slot) => (
                  <div
                    key={slot.time}
                    className="grid border-t border-stone-200 text-center"
                    style={{
                      gridTemplateColumns: `100px repeat(${allStaff.length}, minmax(90px, 1fr))`,
                    }}
                  >
                    <div className="py-4 text-sm font-bold text-stone-600">
                      {slot.time}
                    </div>

                    {allStaff.map((staff) => {
                      const isAvailable = slot.availableStaff.some(
                        (availableStaff) =>
                          availableStaff.id === staff.id
                      );

                      return isAvailable && people === 1 ? (
                        <Link
                          key={staff.id}
                          href={buildConfirmUrl(slot.time, [staff])}
                          className="m-2 rounded-xl bg-green-800 py-3 font-bold text-white"
                        >
                          ○
                        </Link>
                      ) : (
                        <div
                          key={staff.id}
                          className="m-2 rounded-xl bg-stone-100 py-3 font-bold text-stone-300"
                        >
                          ×
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </Card>
          )
        ) : null}

        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
          <Link href="/booking">
            <Button variant="secondary">条件を変更する</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
