"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { STAFF_GENDER_OPTIONS, type StaffGender } from "@/lib/staffGender";

export default function NewStaffPage() {
  const router = useRouter();
  const { dictionary } = useLocale();
  const t = dictionary.admin.staff;
  const tNew = dictionary.admin.staffNew;

  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [gender, setGender] = useState<StaffGender | null>(null);
  const [skills, setSkills] = useState("");
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!name.trim()) {
      setError(tNew.errorNameRequired);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
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
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        setError(data?.error || tNew.errorGeneric);
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/staff");
      router.refresh();
    } catch {
      setError(tNew.errorGeneric);
      setIsSubmitting(false);
    }
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link
          href="/admin/staff"
          className="text-sm font-bold text-stone-500"
        >
          {t.backLink}
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            {tNew.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{tNew.subtitle}</p>
        </Card>

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
                placeholder={t.namePlaceholder}
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
                placeholder={t.descriptionPlaceholder}
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-stone-700">
                {t.genderLabel}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {STAFF_GENDER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setGender((current) =>
                        current === option ? null : option
                      )
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
                placeholder={t.skillsPlaceholder}
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3">
              <div>
                <p className="font-bold text-stone-900">
                  {t.activeToggleLabel}
                </p>

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
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              >
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tNew.submitButtonLoading : tNew.submitButton}
            </Button>
          </Card>
        </form>
      </div>
    </AdminFrame>
  );
}
