"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { INTL_LOCALE_TAGS } from "@/lib/i18n/intlLocale";

type Holiday = {
  id: string;
  date: string;
  reason: string;
};

export default function AdminHolidaysPage() {
  const { locale, dictionary } = useLocale();
  const t = dictionary.admin.holidays;

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  useEffect(() => {
    async function loadHolidays() {
      const response = await fetch("/api/holidays", {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage(t.loadError);
        setMessageIsError(true);
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as Holiday[];

      setHolidays(data);
      setIsLoading(false);
    }

    loadHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addHoliday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || isSubmitting) {
      return;
    }

    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/holidays", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: `${date}T00:00:00.000Z`,
        reason: reason.trim() || t.defaultReason,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      setMessage(body?.error || t.addError);
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    const holiday = (await response.json()) as Holiday;

    setHolidays((current) =>
      [...current, holiday].sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );

    setDate("");
    setReason("");
    setMessage(t.addSuccess);
    setMessageIsError(false);
    setIsSubmitting(false);
  }

  async function deleteHoliday(id: string) {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(t.deleteConfirm);

    if (!confirmed) {
      return;
    }

    setMessage("");
    setDeletingId(id);

    const response = await fetch(`/api/holidays/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage(t.deleteError);
      setMessageIsError(true);
      setDeletingId("");
      return;
    }

    setHolidays((current) =>
      current.filter((holiday) => holiday.id !== id)
    );

    setMessage(t.deleteSuccess);
    setMessageIsError(false);
    setDeletingId("");
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(INTL_LOCALE_TAGS[locale], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(new Date(value));
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">{dictionary.admin.common.backToMain}</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">
            Yoyakus Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            {t.pageTitle}
          </h1>

          <p className="mt-2 text-sm text-stone-500">{t.subtitle}</p>
        </Card>

        <form onSubmit={addHoliday}>
          <Card className="space-y-4">
            <div>
              <label
                htmlFor="holiday-date"
                className="text-sm font-bold text-stone-700"
              >
                {t.dateLabel}
              </label>

              <input
                id="holiday-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <div>
              <label
                htmlFor="holiday-reason"
                className="text-sm font-bold text-stone-700"
              >
                {t.reasonLabel}
              </label>

              <input
                id="holiday-reason"
                type="text"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t.reasonPlaceholder}
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.addButtonLoading : t.addButton}
            </Button>
          </Card>
        </form>

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

        {isLoading ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              {t.loading}
            </p>
          </Card>
        ) : holidays.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-stone-500">
              {t.emptyState}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <Card key={holiday.id} className="space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">
                    {formatDate(holiday.date)}
                  </h2>

                  <p className="text-sm text-stone-500">
                    {holiday.reason}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteHoliday(holiday.id)}
                  disabled={Boolean(deletingId)}
                  className="w-full rounded-2xl border border-red-300 py-2.5 font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === holiday.id ? t.deleteButtonLoading : t.deleteButton}
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminFrame>
  );
}

