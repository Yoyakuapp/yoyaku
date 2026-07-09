"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NewStaffPage() {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [skills, setSkills] = useState("");

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin/staff" className="text-sm font-bold text-stone-500">
          ← 施術者管理
        </Link>

        <Card>
          <h1 className="text-3xl font-bold text-stone-900">
            施術者登録
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            新しい施術者を登録します。
          </p>
        </Card>

        <Card className="space-y-4">
          <div>
            <label className="text-sm font-bold text-stone-700">
              施術者名
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：AIKO"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              説明
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例：強め・肩首"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              得意分野
            </label>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="例：肩こり, 首, 強め"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <Button>登録する</Button>
        </Card>

        <Card>
          <p className="text-sm text-stone-500">
            ※ 現在は画面のみです。次の段階でデータベースへ保存できるようにします。
          </p>
        </Card>
      </div>
    </MobileFrame>
  );
}"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function NewStaffPage() {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [skills, setSkills] = useState("");
  const [active, setActive] = useState(true);

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin/staff" className="text-sm font-bold text-stone-500">
          ← 施術者管理
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            施術者登録
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            新しい施術者を登録します。
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
              placeholder="例：AIKO"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">説明</label>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="例：強め・肩首"
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
              placeholder="例：肩こり, 首, 強め"
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

          <Button>登録する</Button>
        </Card>
      </div>
    </MobileFrame>
  );
}