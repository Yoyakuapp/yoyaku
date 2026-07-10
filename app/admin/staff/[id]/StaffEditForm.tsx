"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type StaffEditFormProps = {
  staff: {
    id: string;
    name: string;
    label: string;
    skills: string[];
    active: boolean;
  };
};

export default function StaffEditForm({
  staff,
}: StaffEditFormProps) {
  const router = useRouter();

  const [name, setName] = useState(staff.name);
  const [label, setLabel] = useState(staff.label);
  const [skills, setSkills] = useState(staff.skills.join(", "));
  const [active, setActive] = useState(staff.active);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || isDeleting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    const response = await fetch(`/api/staff/${staff.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        label,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        active,
      }),
    });

    if (!response.ok) {
      setIsSubmitting(false);
      setError("施術者情報の保存に失敗しました。");
      return;
    }

    router.push("/admin/staff");
    router.refresh();
  }

  async function handleDelete() {
    if (isSubmitting || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      "この施術者を削除します。よろしいですか？"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(true);

    const response = await fetch(`/api/staff/${staff.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setIsDeleting(false);
      setError("施術者の削除に失敗しました。");
      return;
    }

    router.push("/admin/staff");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-4">
        <div>
          <label
            htmlFor="staff-name"
            className="text-sm font-bold text-stone-700"
          >
            施術者名
          </label>

          <input
            id="staff-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="staff-label"
            className="text-sm font-bold text-stone-700"
          >
            説明
          </label>

          <input
            id="staff-label"
            type="text"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />
        </div>

        <div>
          <label
            htmlFor="staff-skills"
            className="text-sm font-bold text-stone-700"
          >
            得意分野
          </label>

          <input
            id="staff-skills"
            type="text"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />

          <p className="mt-2 text-xs text-stone-500">
            複数入力する場合はカンマで区切ってください。
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3">
          <div>
            <p className="font-bold text-stone-900">稼働状態</p>

            <p className="text-sm text-stone-500">
              予約画面に表示するかを設定します。
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActive((current) => !current)}
            className={
              active
                ? "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                : "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
            }
          >
            {active ? "ON" : "OFF"}
          </button>
        </div>

        {error ? (
          <p className="text-sm font-bold text-red-700">{error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting || isDeleting}
        >
          {isSubmitting ? "保存中..." : "保存する"}
        </Button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "削除中..." : "施術者を削除する"}
        </button>
      </Card>
    </form>
  );
}