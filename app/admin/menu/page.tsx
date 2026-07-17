"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";

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

function normalizeDigits(value: string) {
  const halfWidth = value.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );

  return halfWidth.replace(/[^0-9]/g, "");
}

function parseIntField(value: string): number | null {
  const normalized = normalizeDigits(value.trim());

  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
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

type ValidatedMenuPayload = {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  depositRate: number;
  currency: string;
  displayOrder: number;
};

function validateForm(form: MenuForm): ValidatedMenuPayload | string {
  const name = form.name.trim();

  if (!name) {
    return "メニュー名を入力してください。";
  }

  const durationMinutes = parseIntField(form.durationMinutes);

  if (durationMinutes === null || durationMinutes < 15 || durationMinutes > 480) {
    return "時間は15〜480の数字で入力してください。";
  }

  const price = parseIntField(form.price);

  if (price === null || price < 0) {
    return "料金は0以上の数字で入力してください。";
  }

  const depositRate = parseIntField(form.depositRate);

  if (depositRate === null || depositRate < 0 || depositRate > 100) {
    return "予約金率は0〜100の数字で入力してください。";
  }

  const displayOrder = parseIntField(form.displayOrder) ?? 0;

  return {
    name,
    description: form.description.trim(),
    durationMinutes,
    price,
    depositRate,
    currency: "JPY",
    displayOrder,
  };
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<ServiceMenu[]>([]);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [editingForm, setEditingForm] = useState<MenuForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
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
        setMessageIsError(true);
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

  async function createMenu() {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(form);

    if (typeof validated === "string") {
      setMessage(validated);
      setMessageIsError(true);
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch("/api/service-menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated),
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
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setMenus((current) => [...current, data]);
    setForm(emptyForm);
    setMessage("メニューを作成しました。");
    setMessageIsError(false);
    setIsSubmitting(false);
  }

  async function saveEdit(id: string) {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(editingForm);

    if (typeof validated === "string") {
      setMessage(validated);
      setMessageIsError(true);
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch(`/api/service-menus/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated),
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
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setMenus((current) =>
      current.map((menu) => (menu.id === id ? data : menu))
    );
    setEditingId("");
    setMessage("メニューを更新しました。");
    setMessageIsError(false);
    setIsSubmitting(false);
  }

  async function toggleActive(menu: ServiceMenu) {
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch(`/api/service-menus/${menu.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: !menu.isActive,
      }),
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
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setMenus((current) =>
      current.map((m) => (m.id === menu.id ? data : m))
    );
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
    <AdminFrame>
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

        {message ? (
          <Card>
            <p
              className={
                messageIsError
                  ? "text-sm font-bold text-red-700"
                  : "text-sm font-bold text-green-800"
              }
            >
              {message}
            </p>
          </Card>
        ) : null}

        <Card>
          {isLoading ? (
            <p className="text-sm text-stone-500">読み込み中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-bold text-stone-500">
                    <th className="py-2 pr-3">メニュー名</th>
                    <th className="py-2 pr-3">時間(分)</th>
                    <th className="py-2 pr-3">料金(¥)</th>
                    <th className="py-2 pr-3">予約金率(%)</th>
                    <th className="py-2 pr-3">表示順</th>
                    <th className="py-2 pr-3">状態</th>
                    <th className="py-2 pr-3">操作</th>
                  </tr>
                </thead>

                <tbody>
                  {menus.map((menu) => {
                    const isEditing = editingId === menu.id;
                    const rowForm = isEditing ? editingForm : toForm(menu);

                    return (
                      <tr
                        key={menu.id}
                        className="border-b border-stone-100 align-middle"
                      >
                        {isEditing ? (
                          <>
                            <td className="py-2 pr-3">
                              <input
                                value={rowForm.name}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.durationMinutes}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "durationMinutes",
                                    e.target.value
                                  )
                                }
                                className="w-20 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.price}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className="w-24 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.depositRate}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "depositRate",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.displayOrder}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "displayOrder",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 pr-3 font-bold text-stone-900">
                              {menu.name}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              {menu.durationMinutes}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              ¥{menu.price.toLocaleString()}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              {menu.price > 0
                                ? Math.round((menu.deposit / menu.price) * 100)
                                : 0}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              {menu.displayOrder}
                            </td>
                          </>
                        )}

                        <td className="py-2 pr-3">
                          <span
                            className={
                              menu.isActive
                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                                : "rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500"
                            }
                          >
                            {menu.isActive ? "表示中" : "停止中"}
                          </span>
                        </td>

                        <td className="py-2 pr-3">
                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => saveEdit(menu.id)}
                                  className="rounded-xl border border-green-800 px-3 py-1.5 text-xs font-bold text-green-800 disabled:opacity-50"
                                >
                                  保存
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId("")}
                                  className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700"
                                >
                                  中止
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(menu.id);
                                    setEditingForm(toForm(menu));
                                  }}
                                  className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700"
                                >
                                  編集
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => toggleActive(menu)}
                                  className="rounded-xl border border-green-800 px-3 py-1.5 text-xs font-bold text-green-800 disabled:opacity-50"
                                >
                                  {menu.isActive ? "停止" : "表示"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="align-middle">
                    <td className="py-2 pr-3">
                      <input
                        value={form.name}
                        onChange={(e) =>
                          updateForm(setForm, form, "name", e.target.value)
                        }
                        placeholder="新しいメニュー名"
                        className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.durationMinutes}
                        onChange={(e) =>
                          updateForm(
                            setForm,
                            form,
                            "durationMinutes",
                            e.target.value
                          )
                        }
                        className="w-20 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.price}
                        onChange={(e) =>
                          updateForm(setForm, form, "price", e.target.value)
                        }
                        className="w-24 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.depositRate}
                        onChange={(e) =>
                          updateForm(
                            setForm,
                            form,
                            "depositRate",
                            e.target.value
                          )
                        }
                        className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.displayOrder}
                        onChange={(e) =>
                          updateForm(
                            setForm,
                            form,
                            "displayOrder",
                            e.target.value
                          )
                        }
                        className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3" />
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => createMenu()}
                        className="rounded-xl border border-green-800 bg-green-800 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        追加
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-2 font-bold">説明文(新規メニュー用)</p>

          <textarea
            value={form.description}
            onChange={(e) =>
              updateForm(setForm, form, "description", e.target.value)
            }
            rows={3}
            placeholder="表の「追加」ボタンで作成するメニューの説明文(任意)"
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />
        </Card>
      </div>
    </AdminFrame>
  );
}
