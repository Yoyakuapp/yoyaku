"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type BusinessHour = {
  id?: string;
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
};

export default function AdminHoursPage() {
  const { dictionary } = useLocale();
  const t = dictionary.admin;

  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  useEffect(() => {
    async function loadHours() {
      const response = await fetch("/api/business-hours", {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage(t.hours.loadError);
        setMessageIsError(true);
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as BusinessHour[];

      setHours(data);
      setIsLoading(false);
    }

    loadHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateHour(
    dayOfWeek: number,
    field: "isClosed" | "openTime" | "closeTime",
    value: boolean | string
  ) {
    setHours((currentHours) =>
      currentHours.map((hour) =>
        hour.dayOfWeek === dayOfWeek
          ? {
              ...hour,
              [field]: value,
            }
          : hour
      )
    );
  }

  async function saveHours() {
    if (isSaving) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSaving(true);

    const response = await fetch("/api/business-hours", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hours: hours.map((hour) => ({
          dayOfWeek: hour.dayOfWeek,
          isClosed: hour.isClosed,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
        })),
      }),
    });

    if (!response.ok) {
      setMessage(t.hours.saveError);
      setMessageIsError(true);
      setIsSaving(false);
      return;
    }

    const data = (await response.json()) as BusinessHour[];

    setHours(data);
    setMessage(t.hours.saveSuccess);
    setMessageIsError(false);
    setIsSaving(false);
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">{t.common.backToMain}</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">
            Yoyakus Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            {t.hours.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{t.hours.subtitle}</p>
        </Card>

        {isLoading ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              {t.hours.loading}
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {hours.map((hour) => (
                <Card key={hour.dayOfWeek} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-stone-900">
                      {t.hours.dayLabels[hour.dayOfWeek]}
                    </h2>

                    <button
                      type="button"
                      onClick={() =>
                        updateHour(
                          hour.dayOfWeek,
                          "isClosed",
                          !hour.isClosed
                        )
                      }
                      className={
                        hour.isClosed
                          ? "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
                          : "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                      }
                    >
                      {hour.isClosed ? t.hours.closedLabel : t.hours.openLabel}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor={`open-${hour.dayOfWeek}`}
                        className="mb-2 block text-sm font-bold text-stone-700"
                      >
                        {t.hours.openTimeLabel}
                      </label>

                      <input
                        id={`open-${hour.dayOfWeek}`}
                        type="time"
                        value={hour.openTime}
                        disabled={hour.isClosed}
                        onChange={(event) =>
                          updateHour(
                            hour.dayOfWeek,
                            "openTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`close-${hour.dayOfWeek}`}
                        className="mb-2 block text-sm font-bold text-stone-700"
                      >
                        {t.hours.closeTimeLabel}
                      </label>

                      <input
                        id={`close-${hour.dayOfWeek}`}
                        type="time"
                        value={hour.closeTime}
                        disabled={hour.isClosed}
                        onChange={(event) =>
                          updateHour(
                            hour.dayOfWeek,
                            "closeTime",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

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

            <Button onClick={saveHours} disabled={isSaving}>
              {isSaving ? t.hours.saveButtonLoading : t.hours.saveButton}
            </Button>
          </>
        )}
      </div>
    </AdminFrame>
  );
}
