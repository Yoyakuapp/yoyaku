"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type MenuItem = {
  id: number;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([
    {
      id: 1,
      name: "タイ古式マッサージ 30分",
      duration: 30,
      price: 4500,
      active: true,
    },
    {
      id: 2,
      name: "タイ古式マッサージ 60分",
      duration: 60,
      price: 9000,
      active: true,
    },
    {
      id: 3,
      name: "タイ古式マッサージ 90分",
      duration: 90,
      price: 13500,
      active: true,
    },
    {
      id: 4,
      name: "タイ古式マッサージ 120分",
      duration: 120,
      price: 18000,
      active: true,
    },
  ]);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  function addMenu() {
    if (!name || !duration || !price) return;

    setMenus([
      ...menus,
      {
        id: Date.now(),
        name,
        duration: Number(duration),
        price: Number(price),
        active: true,
      },
    ]);

    setName("");
    setDuration("");
    setPrice("");
  }

  function toggleActive(id: number) {
    setMenus(
      menus.map((menu) =>
        menu.id === id
          ? {
              ...menu,
              active: !menu.active,
            }
          : menu
      )
    );
  }

  function deleteMenu(id: number) {
    setMenus(menus.filter((menu) => menu.id !== id));
  }

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            メニュー管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            施術メニュー・時間・料金を管理します。
          </p>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900">
            メニュー追加
          </h2>

          <div>
            <label className="text-sm font-bold text-stone-700">
              メニュー名
            </label>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例：タイ古式マッサージ 60分"
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-stone-700">
                時間
              </label>

              <input
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="60"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-stone-700">
                料金
              </label>

              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="9000"
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>
          </div>

          <Button onClick={addMenu}>追加する</Button>
        </Card>

        <div className="space-y-3">
          {menus.map((menu) => (
            <Card key={menu.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {menu.name}
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    {menu.duration}分・¥{menu.price.toLocaleString()}
                  </p>
                </div>

                <span
                  className={
                    menu.active
                      ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                      : "rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500"
                  }
                >
                  {menu.active ? "表示中" : "停止中"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleActive(menu.id)}
                  className="rounded-2xl border border-green-800 py-2.5 font-bold text-green-800"
                >
                  {menu.active ? "停止" : "表示"}
                </button>

                <button
                  onClick={() => deleteMenu(menu.id)}
                  className="rounded-2xl border border-red-300 py-2.5 font-bold text-red-600"
                >
                  削除
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}