"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type BookingRescheduleFormProps = {
  bookingId: string;
  initialDate: string;
  initialTime: string;
  initialStaff: string;
  people: number;
  staffOptions: string[];
  canReschedule: boolean;
};

type BookingResponse = {
  error?: string;
};

export default function BookingRescheduleForm({
  bookingId,
  initialDate,
  initialTime,
  initialStaff,
  people,
  staffOptions,
  canReschedule,
}: BookingRescheduleFormProps) {
  const { dictionary } = useLocale();
  const t = dictionary.admin.bookingDetail;
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [staffValues, setStaffValues] = useState(() => {
    const initialStaffValues = initialStaff
      .split("+")
      .map((name) => name.trim())
      .filter(Boolean);

    return Array.from(
      { length: people },
      (_, index) => initialStaffValues[index] ?? ""
    );
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateStaff(index: number, value: string) {
    setStaffValues((current) =>
      current.map((staffName, currentIndex) =>
        currentIndex === index ? value : staffName
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !canReschedule) {
      return;
    }

    setMessage("");

    const bookingDate = new Date(`${date}T${time}:00.000Z`);

    if (Number.isNaN(bookingDate.getTime())) {
      setMessage(t.invalidDateTimeError);
      return;
    }

    setIsSubmitting(true);

    const staff = staffValues.map((staffName) => staffName.trim()).join(" + ");

    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: bookingDate.toISOString(),
        staff,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | BookingResponse
      | null;

    if (!response.ok) {
      setMessage(data?.error || t.rescheduleError);
      setIsSubmitting(false);
      return;
    }

    setMessage(t.rescheduleSuccess);
    router.refresh();
    setIsSubmitting(false);
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-stone-900">{t.rescheduleHeading}</h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="booking-date"
            className="text-sm font-bold text-stone-700"
          >
            {t.changeDateLabel}
          </label>

          <input
            id="booking-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={!canReschedule || isSubmitting}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
          />
        </div>

        <div>
          <label
            htmlFor="booking-time"
            className="text-sm font-bold text-stone-700"
          >
            {t.startTimeLabel}
          </label>

          <input
            id="booking-time"
            type="time"
            step="1800"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            disabled={!canReschedule || isSubmitting}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
          />
        </div>

        {staffValues.map((staffName, index) => (
          <div key={index}>
            <label
              htmlFor={`booking-staff-${index}`}
              className="text-sm font-bold text-stone-700"
            >
              {t.staffChangeLabel(index + 1)}
            </label>

            <select
              id={`booking-staff-${index}`}
              value={staffName}
              onChange={(event) => updateStaff(index, event.target.value)}
              disabled={!canReschedule || isSubmitting}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
            >
              <option value="">{t.selectPlaceholder}</option>

              {staffOptions.map((staffOption) => (
                <option key={staffOption} value={staffOption}>
                  {staffOption}
                </option>
              ))}
            </select>
          </div>
        ))}

        {message ? (
          <p className="text-sm font-bold text-stone-600">{message}</p>
        ) : null}

        <Button type="submit" disabled={!canReschedule || isSubmitting}>
          {t.rescheduleSaveButton}
        </Button>
      </form>
    </Card>
  );
}

