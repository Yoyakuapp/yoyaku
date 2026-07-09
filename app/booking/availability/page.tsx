"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  createTimes,
  isStaffAvailable,
  staffList,
} from "@/data/yoyakuData";

type ViewMode = "list" | "table";

const selectedDate = "2026-07-09";

export default function AvailabilityPage() {
  const searchParams = useSearchParams();

  const when = searchParams.get("when") || "今すぐ";
  const duration = Number(searchParams.get("duration") || 60);
  const people = Number(searchParams.get("people") || 1);

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const times = useMemo(() => createTimes(), []);

  const slotsNeeded = Math.ceil(duration / 30);

  function canStaffTake(staffId: string, startTime: string) {
    const startIndex = times.indexOf(startTime);
    if (startIndex < 0) return false;
    if (startIndex + slotsNeeded > times.length) return false;

    for (let i = 0; i < slotsNeeded; i++) {
      const checkTime = times[startIndex + i];
      if (!isStaffAvailable(staffId, selectedDate, checkTime)) {
        return false;
      }
    }

    return true;
  }

  function availableStaffAtTime(time: string) {
    return staffList.filter((staff) => canStaffTake(staff.id, time));
  }

  function combinations<T>(items: T[], count: number): T[][] {
    if (count <= 1) return items.map((item) => [item]);
    if (count > items.length) return [];

    const result: T[][] = [];

    function walk(start: number, current: T[]) {
      if (current.length === count) {
        result.push(current);
        return;
      }

      for (let i = start; i < items.length; i++) {
        walk(i + 1, [...current, items[i]]);
      }
    }

    walk(0, []);
    return result;
  }

  function availableGroupsAtTime(time: string) {
    return combinations(availableStaffAtTime(time), people);
  }

  const availableTimes = times.filter(
    (time) => availableGroupsAtTime(time).length > 0
  );

  const firstAvailableTime = availableTimes[0];

  function statusLabel(time: string) {
    const groupCount = availableGroupsAtTime(time).length;
    if (groupCount >= 3) return "◎ 空きあり";
    if (groupCount === 2) return "○ 予約可";
    if (groupCount === 1) return "△ 残り1枠";
    return "満席";
  }

  function statusClass(time: string) {
    const groupCount = availableGroupsAtTime(time).length;
    if (groupCount >= 3) return "bg-green-800 text-white";
    if (groupCount === 2) return "bg-green-700 text-white";
    if (groupCount === 1) return "bg-amber-500 text-white";
    return "bg-stone-100 text-stone-300";
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <Link href="/booking" className="text-sm font-bold text-stone-500">
            ← 条件変更
          </Link>

          <p className="text-sm font-bold text-green-800">
            {when}・{duration}分・{people}人
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
              {when}・{duration}分・{people}人ですね。今なら以下の時間が空いています。
            </p>
          </div>

          {firstAvailableTime ? (
            <div className="rounded-3xl bg-gradient-to-br from-green-900 to-green-700 p-5 text-white">
              <p className="text-sm text-white/70">最短で予約できます</p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-bold">{firstAvailableTime}</p>
                  <p className="mt-1 text-sm text-white/80">
                    {availableGroupsAtTime(firstAvailableTime)[0]
                      ?.map((staff) => staff.name)
                      .join(" + ")}
                  </p>
                </div>

                <Link
                  href={`/booking/confirm?when=${when}&duration=${duration}&people=${people}&time=${firstAvailableTime}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-800"
                >
                  選択
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-stone-100 p-5">
              <p className="font-bold text-stone-800">
                条件に合う空き時間がありません。
              </p>
              <p className="mt-1 text-sm text-stone-500">
                時間または人数を変更してください。
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 rounded-2xl bg-stone-100 p-1">
            <button
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

        {viewMode === "list" && (
          <div className="space-y-3">
            {times.map((time) => {
              const groups = availableGroupsAtTime(time);
              const isAvailable = groups.length > 0;

              return (
                <Card
                  key={time}
                  className={
                    isAvailable
                      ? "space-y-3"
                      : "flex items-center justify-between opacity-50"
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-stone-900">
                        {time}
                      </p>

                      <p className="mt-1 text-sm text-stone-500">
                        {isAvailable
                          ? `${groups.length}通りの組み合わせ`
                          : "予約できません"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-bold ${statusClass(
                        time
                      )}`}
                    >
                      {statusLabel(time)}
                    </span>
                  </div>

                  {isAvailable && (
                    <div className="space-y-2">
                      {groups.slice(0, 4).map((group) => {
                        const staffNames = group
                          .map((staff) => staff.name)
                          .join(" + ");

                        return (
                          <Link
                            key={`${time}-${staffNames}`}
                            href={`/booking/confirm?when=${when}&duration=${duration}&people=${people}&time=${time}&staff=${encodeURIComponent(
                              staffNames
                            )}`}
                            className="block rounded-2xl bg-green-800 px-4 py-3 text-sm font-bold text-white"
                          >
                            {staffNames}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {viewMode === "table" && (
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-4 bg-stone-100 text-center text-sm font-bold text-stone-700">
              <div className="py-3">時間</div>

              {staffList.map((staff) => (
                <div key={staff.id} className="py-3">
                  {staff.name}
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

                  {staffList.map((staff) => {
                    const ok = canStaffTake(staff.id, time);

                    return (
                      <Link
                        key={staff.id}
                        href={
                          ok
                            ? `/booking/confirm?when=${when}&duration=${duration}&people=1&time=${time}&staff=${staff.name}`
                            : "#"
                        }
                        className={
                          ok
                            ? "m-2 rounded-xl bg-green-800 py-3 font-bold text-white"
                            : "m-2 rounded-xl bg-stone-100 py-3 font-bold text-stone-300"
                        }
                      >
                        {ok ? "○" : "×"}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
          <Link href="/booking">
            <Button variant="secondary">条件を変更する</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}