"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type ServiceMenu = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  deposit: number;
  currency: string;
  isActive: boolean;
  displayOrder: number;
};

type MenuForm = {
  name: string;
  description: string;
  durationMinutes: string;
  price: string;
  depositRate: string;
  displayOrder: string;
};

const emptyForm: MenuForm = {
  name: "",
  description: "",
  durationMinutes: "60",
  price: "9000",
  depositRate: "15",
  displayOrder: "0",
};

function toPayload(form: MenuForm) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    durationMinutes: Number(form.durationMinutes),
    price: Number(form.price),
    depositRate: Number(form.depositRate),
    currency: "JPY",
    displayOrder: Number(form.displayOrder),
  };
}

function toForm(menu: ServiceMenu): MenuForm {
  return {
    name: menu.name,
    description: menu.description,
    durationMinutes: String(menu.durationMinutes),
    price: String(menu.price),
    depositRate:
      menu.price > 0 ? String(Math.round((menu.deposit / menu.price) * 100)) : "0",
    displayOrder: String(menu.displayOrder),
  };
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<ServiceMenu[]>([]);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [editingForm, setEditingForm] = useState<MenuForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMenus() {
      const response = await fetch("/api/service-menus?includeInactive=true", {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | ServiceMenu[]
        | { error?: string }
        | null;

      if (!isMounted) {
        return;
      }

      if (!response.ok || !Array.isArray(data)) {
        setMessage(
          data && !Array.isArray(data) && data.error
            ? data.error
            : "メニューの読み込みに失敗しました。"
        );
        setIsLoading(false);
        return;
      }

      setMenus(data);
      setIsLoading(false);
    }

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, []);

  async function createMenu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/service-menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toPayload(form)),
    });

    const data = (await response.json().catch(() => null)) as
      | ServiceMenu
      | { error?: string }
      | null;

    if (!response.ok || !data || !("id" in data)) {
      setMessage(
        data && "error" in data && data.error
          ? data.error
          : "メニューの作成に失敗しました。"
      );
      setIsSubmitting(false);
      return;
    }

    setMenus((current) => [...current, data]);
    setForm(emptyForm);
    setMessage("メニューを作成しました。");
    setIsSubmitting(false);
  }

  async function updateMenu(id: string, payload: Partial<ServiceMenu>) {
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    const response = await fetch(`/api/service-menus/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | ServiceMenu
      | { error?: string }
      | null;

    if (!response.ok || !data || !("id" in data)) {
      setMessage(
        data && "error" in data && data.error
          ? data.error
          : "メニューの更新に失敗しました。"
      );
      setIsSubmitting(false);
      return;
    }

    setMenus((current) =>
      current.map((menu) => (menu.id === id ? data : menu))
    );
    setEditingId("");
    setMessage("メニューを更新しました。");
    setIsSubmitting(false);
  }

  function updateForm(
    setter: (value: MenuForm) => void,
    current: MenuForm,
    field: keyof MenuForm,
    value: string
  ) {
    setter({
      ...current,
      [field]: value,
    });
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
            施術メニュー、時間、料金、予約金を店舗単位で管理します。
          </p>
        </Card>

        <Card>
          <form onSubmit={createMenu} className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">
              メニュー作成
            </h2>

            <div>
              <label className="text-sm font-bold text-stone-700">
                メニュー名
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  updateForm(setForm, form, "name", event.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-stone-700">
                説明
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm(setForm, form, "description", event.target.value)
                }
                rows={3}
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-stone-700">
                  時間
                </label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(event) =>
                    updateForm(
                      setForm,
                      form,
                      "durationMinutes",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-stone-700">
                  料金
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    updateForm(setForm, form, "price", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-stone-700">
                  予約金率
                </label>
                <input
                  type="number"
                  value={form.depositRate}
                  onChange={(event) =>
                    updateForm(setForm, form, "depositRate", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-stone-700">
                  表示順
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(event) =>
                    updateForm(setForm, form, "displayOrder", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                />
              </div>
            </div>

            <Button disabled={isSubmitting}>作成する</Button>
          </form>
        </Card>

        {message ? (
          <p className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-700">
            {message}
          </p>
        ) : null}

        {isLoading ? (
          <Card>
            <p className="text-sm text-stone-500">読み込み中...</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {menus.map((menu) => {
              const isEditing = editingId === menu.id;
              const currentForm = isEditing ? editingForm : toForm(menu);

              return (
                <Card key={menu.id} className="space-y-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        value={currentForm.name}
                        onChange={(event) =>
                          updateForm(
                            setEditingForm,
                            currentForm,
                            "name",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={currentForm.durationMinutes}
                          onChange={(event) =>
                            updateForm(
                              setEditingForm,
                              currentForm,
                              "durationMinutes",
                              event.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                        />
                        <input
                          type="number"
                          value={currentForm.price}
                          onChange={(event) =>
                            updateForm(
                              setEditingForm,
                              currentForm,
                              "price",
                              event.target.value
                            )
                          }
                          className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-stone-900">
                          {menu.name}
                        </h2>
                        <p className="mt-1 text-sm text-stone-500">
                          {menu.durationMinutes}分・¥
                          {menu.price.toLocaleString()}・予約金 ¥
                          {menu.deposit.toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={
                          menu.isActive
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                            : "rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500"
                        }
                      >
                        {menu.isActive ? "表示中" : "停止中"}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            updateMenu(menu.id, toPayload(editingForm))
                          }
                          className="rounded-2xl border border-green-800 py-2.5 font-bold text-green-800 disabled:opacity-50"
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId("")}
                          className="rounded-2xl border border-stone-300 py-2.5 font-bold text-stone-700"
                        >
                          中止
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(menu.id);
                          setEditingForm(toForm(menu));
                        }}
                        className="rounded-2xl border border-stone-300 py-2.5 font-bold text-stone-700"
                      >
                        編集
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        updateMenu(menu.id, {
                          isActive: !menu.isActive,
                        })
                      }
                      className="rounded-2xl border border-green-800 py-2.5 font-bold text-green-800 disabled:opacity-50"
                    >
                      {menu.isActive ? "停止" : "表示"}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
