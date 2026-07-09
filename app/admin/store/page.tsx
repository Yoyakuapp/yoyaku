"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function StoreAdminPage() {
  const [store, setStore] = useState({
    name: "Sakura Thai Massage",
    description:
      "本場タイ古式マッサージ。完全個室・駅徒歩3分。",
    phone: "03-1234-5678",
    address: "東京都渋谷区○○○○",
    open: "10:00",
    close: "20:00",
    holiday: "不定休",
  });

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

          <h1 className="mt-2 text-3xl font-bold">
            店舗情報
          </h1>
        </Card>

        {[
          ["店舗名", "name"],
          ["紹介文", "description"],
          ["電話番号", "phone"],
          ["住所", "address"],
          ["営業時間開始", "open"],
          ["営業時間終了", "close"],
          ["定休日", "holiday"],
        ].map(([label, key]) => (
          <Card key={key}>
            <p className="mb-2 font-bold">
              {label}
            </p>

            <input
              className="w-full rounded-2xl border p-3"
              value={store[key as keyof typeof store]}
              onChange={(e) =>
                setStore({
                  ...store,
                  [key]: e.target.value,
                })
              }
            />
          </Card>
        ))}

        <Button>
          保存
        </Button>

      </div>
    </MobileFrame>
  );
}