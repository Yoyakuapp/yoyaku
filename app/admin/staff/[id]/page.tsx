"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { adminStaffList } from "@/data/adminStaffData";

type StaffEditPageProps = {
  params: {
    id: string;
  };
};

export default function StaffEditPage({ params }: StaffEditPageProps) {
  const staff = adminStaffList.find((person) => person.id === params.id);

  const [name, setName] = useState(staff?.name || "");
  const [label, setLabel] = useState(staff?.label || "");
  const [skills, setSkills] = useState(staff?.skills.join(", ") || "");
  const [active, setActive] = useState(staff?.active ?? true);

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin/staff" className="text-sm font-bold text-stone-500">
          ← 施術者管理
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            施術者編集
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            施術者情報を編集します。
          </p>
        </Card>

        <Card className="space-y-4">
          <div>
            <label className="text-sm font-bold text-stone-700">
              施術者名
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">説明</label>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              得意分野
            </label>
            <input
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3">
            <div>
              <p className="font-bold text-stone-900">稼働状態</p>
              <p className="text-sm text-stone-500">
                予約画面に表示するかを設定します。
              </p>
            </div>

            <button
              onClick={() => setActive(!active)}
              className={
                active
                  ? "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
              }
            >
              {active ? "ON" : "OFF"}
            </button>
          </div>

          <Button>保存する</Button>
        </Card>
      </div>
    </MobileFrame>
  );
}