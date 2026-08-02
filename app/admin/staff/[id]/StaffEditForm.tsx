"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  STAFF_GENDER_OPTIONS,
  isStaffGender,
  type StaffGender,
} from "@/lib/staffGender";

type StaffEditFormProps = {
  staff: {
    id: string;
    name: string;
    label: string;
    gender: string | null;
    skills: string[];
    active: boolean;
  };
};

export default function StaffEditForm({
  staff,
}: StaffEditFormProps) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const t = dictionary.admin.staff;
  const tEdit = dictionary.admin.staffEdit;

  const [name, setName] = useState(staff.name);
  const [label, setLabel] = useState(staff.label);
  const [gender, setGender] = useState<StaffGender | null>(
    isStaffGender(staff.gender) ? staff.gender : null
  );
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
        gender,
        skills: skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        active,
      }),
    });

    if (!response.ok) {
      setIsSubmitting(false);
      setError(tEdit.saveError);
      return;
    }

    router.push("/admin/staff");
    router.refresh();
  }

  async function handleDelete() {
    if (isSubmitting || isDeleting) {
      return;
    }

    const confirmed = window.confirm(tEdit.deleteConfirm);

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
      setError(tEdit.deleteError);
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
            {t.nameLabel}
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
            {t.descriptionLabel}
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
          <p className="text-sm font-bold text-stone-700">{t.genderLabel}</p>

          <div className="mt-2 flex flex-wrap gap-2">
            {STAFF_GENDER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setGender((current) => (current === option ? null : option))
                }
                className={
                  gender === option
                    ? "rounded-full border border-green-800 bg-green-800 px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700"
                }
              >
                {t.genderLabels[option]}
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs text-stone-500">
            {t.genderOptionalHint}
          </p>
        </div>

        <div>
          <label
            htmlFor="staff-skills"
            className="text-sm font-bold text-stone-700"
          >
            {t.skillsLabel}
          </label>

          <input
            id="staff-skills"
            type="text"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />

          <p className="mt-2 text-xs text-stone-500">
            {t.skillsHintMultiple}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3">
          <div>
            <p className="font-bold text-stone-900">{t.activeToggleLabel}</p>

            <p className="text-sm text-stone-500">{t.activeToggleHint}</p>
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
            {active ? t.onLabel : t.offLabel}
          </button>
        </div>

        {error ? (
          <p className="text-sm font-bold text-red-700">{error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting || isDeleting}
        >
          {isSubmitting ? tEdit.saveButtonLoading : tEdit.saveButton}
        </Button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting || isDeleting}
          className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? tEdit.deleteButtonLoading : tEdit.deleteButton}
        </button>
      </Card>
    </form>
  );
}
