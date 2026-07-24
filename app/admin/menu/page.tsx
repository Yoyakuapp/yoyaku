"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type MenuCategory = {
  id: string;
  name: string;
  nameEn: string | null;
  displayOrder: number;
};

type ServiceMenu = {
  id: string;
  name: string;
  category: string | null;
  description: string;
  durationMinutes: number;
  price: number;
  deposit: number;
  currency: string;
  isActive: boolean;
  displayOrder: number;
};

type MenuForm = {
  categoryId: string;
  description: string;
  durationMinutes: string;
  price: string;
  depositRate: string;
  displayOrder: string;
};

const emptyForm: MenuForm = {
  categoryId: "",
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

function toForm(menu: ServiceMenu, categories: MenuCategory[]): MenuForm {
  return {
    categoryId: categories.find((c) => c.name === menu.category)?.id ?? "",
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
  category: string | null;
  description: string;
  durationMinutes: number;
  price: number;
  depositRate: number;
  currency: string;
  displayOrder: number;
};

function validateForm(
  form: MenuForm,
  categories: MenuCategory[]
): ValidatedMenuPayload | string {
  const category = categories.find((c) => c.id === form.categoryId);

  if (!category) {
    return "施術メニューを選択してください。";
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
    name: `${category.name} ${durationMinutes}分`,
    category: category.name,
    description: form.description.trim(),
    durationMinutes,
    price,
    depositRate,
    currency: "JPY",
    displayOrder,
  };
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
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

    async function loadCategories() {
      const response = await fetch("/api/menu-categories", {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | MenuCategory[]
        | { error?: string }
        | null;

      if (!isMounted || !response.ok || !Array.isArray(data)) {
        return;
      }

      setCategories(data);
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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

  async function createCategory() {
    const name = newCategoryName.trim();

    if (!name || isSubmitting) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch("/api/menu-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | MenuCategory
      | { error?: string }
      | null;

    if (!response.ok || !data || !("id" in data)) {
      setMessage(
        data && "error" in data && data.error
          ? data.error
          : "カテゴリーの作成に失敗しました。"
      );
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setCategories((current) => [...current, data]);
    setNewCategoryName("");
    setIsSubmitting(false);
  }

  async function deleteCategory(id: string) {
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch(`/api/menu-categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      setMessage(data?.error ?? "カテゴリーの削除に失敗しました。");
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setCategories((current) => current.filter((c) => c.id !== id));
    setIsSubmitting(false);
  }

  function updateCategoryNameEnLocal(id: string, value: string) {
    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, nameEn: value } : category
      )
    );
  }

  async function saveCategoryNameEn(id: string, value: string) {
    await fetch(`/api/menu-categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nameEn: value.trim() || null,
      }),
    });
  }

  async function createMenu() {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(form, categories);

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
    setForm((current) => ({
      ...emptyForm,
      categoryId: current.categoryId,
    }));
    setMessage("メニューを作成しました。");
    setMessageIsError(false);
    setIsSubmitting(false);
  }

  async function saveEdit(id: string) {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(editingForm, categories);

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
        <Link href="/admin" className="block">
          <Button variant="secondary">店舗管理メインへ</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

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

        <Card className="space-y-3">
          <p className="font-bold text-stone-900">
            あなたのお店にはどんなメニューがありますか？
          </p>

          <p className="text-xs leading-5 text-stone-500">
            例: 全身マッサージ、足裏マッサージ、オイルマッサージ、全身＋足裏、オイル＋足裏、など
          </p>

          <div className="flex gap-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="例: 全身マッサージ"
              className="w-full rounded-xl border border-stone-200 px-3 py-2"
            />

            <button
              type="button"
              disabled={isSubmitting || !newCategoryName.trim()}
              onClick={() => createCategory()}
              className="shrink-0 rounded-xl border border-green-800 bg-green-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              追加
            </button>
          </div>

          {categories.length > 0 ? (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-stone-500">
                英語名を入力するとそちらが優先的に表示されます(空欄ならAIが自動翻訳)。中国語・韓国語・ドイツ語など他の言語も、予約ページでお客様がそれぞれの言語を選ぶと自動的に翻訳されて表示されます。
              </p>

              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2"
                >
                  <span className="shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-800">
                    {category.name}
                  </span>

                  <input
                    value={category.nameEn ?? ""}
                    onChange={(e) =>
                      updateCategoryNameEnLocal(category.id, e.target.value)
                    }
                    onBlur={(e) => saveCategoryNameEn(category.id, e.target.value)}
                    placeholder="English name(任意)"
                    className="min-w-0 flex-1 rounded-xl border border-stone-200 px-2 py-1.5 text-sm"
                  />

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => deleteCategory(category.id)}
                    aria-label={`${category.name}を削除`}
                    className="shrink-0 text-red-700/70 transition hover:text-red-700 disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">
              まだメニューが登録されていません。上の欄から追加してください。
            </p>
          )}
        </Card>

        <Card>
          {isLoading ? (
            <p className="text-sm text-stone-500">読み込み中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-bold text-stone-500">
                    <th className="py-2 pr-3">施術メニュー</th>
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
                    const rowForm = isEditing
                      ? editingForm
                      : toForm(menu, categories);

                    return (
                      <tr
                        key={menu.id}
                        className="border-b border-stone-100 align-middle"
                      >
                        {isEditing ? (
                          <>
                            <td className="py-2 pr-3">
                              <select
                                value={rowForm.categoryId}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "categoryId",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                              >
                                <option value="">選択してください</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
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
                                    setEditingForm(toForm(menu, categories));
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
                      <select
                        value={form.categoryId}
                        onChange={(e) =>
                          updateForm(setForm, form, "categoryId", e.target.value)
                        }
                        className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                      >
                        <option value="">施術メニューを選択</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
                        disabled={isSubmitting || categories.length === 0}
                        onClick={() => createMenu()}
                        className="rounded-xl border border-green-800 bg-green-800 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        追加
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {categories.length === 0 ? (
                <p className="mt-2 text-xs text-stone-400">
                  施術時間・料金を追加する前に、上の欄で施術メニューを登録してください。
                </p>
              ) : null}
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
