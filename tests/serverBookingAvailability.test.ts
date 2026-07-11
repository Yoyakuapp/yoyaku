import assert from "node:assert/strict";
import test from "node:test";

import {
  bookingAdvisoryLockKeys,
  bookingOverlaps,
  calculateBookingPrice,
  checkRequestedBookingAvailability,
  combinations,
} from "../lib/serverBookingAvailability";

function createFakeDb(options: {
  isClosed?: boolean;
  bookings?: Array<{
    date: Date;
    duration: number;
    staff: string;
  }>;
  staff?: Array<{
    id: string;
    name: string;
    active: boolean;
    startTime: string;
    endTime: string;
  }>;
}) {
  const staff =
    options.staff ?? [
      {
        id: "staff-aiko",
        name: "AIKO",
        active: true,
        startTime: "10:00",
        endTime: "20:00",
      },
      {
        id: "staff-emi",
        name: "EMI",
        active: true,
        startTime: "10:00",
        endTime: "20:00",
      },
    ];

  return {
    holiday: {
      findUnique: async () => null,
    },
    businessHour: {
      findUnique: async () => ({
        dayOfWeek: 0,
        isClosed: options.isClosed ?? false,
        openTime: "10:00",
        closeTime: "20:00",
      }),
    },
    shift: {
      findMany: async () =>
        staff
          .filter((person) => person.active)
          .map((person) => ({
            startTime: person.startTime,
            endTime: person.endTime,
            staff: {
              id: person.id,
              name: person.name,
            },
          })),
    },
    booking: {
      findMany: async () => options.bookings ?? [],
    },
    bookingPaymentAttempt: {
      findMany: async () => [],
    },
  };
}

test("bookingOverlaps detects overlapping staff bookings", () => {
  const booking = {
    date: new Date("2026-07-13T10:30:00.000Z"),
    duration: 60,
    staff: "AIKO",
  };

  assert.equal(bookingOverlaps(booking, 10 * 60, 11 * 60, "AIKO"), true);
  assert.equal(bookingOverlaps(booking, 11 * 60 + 30, 12 * 60, "AIKO"), false);
  assert.equal(bookingOverlaps(booking, 10 * 60, 11 * 60, "EMI"), false);
});

test("checkRequestedBookingAvailability rejects an already booked staff member", async () => {
  const db = createFakeDb({
    bookings: [
      {
        date: new Date("2026-07-13T10:30:00.000Z"),
        duration: 60,
        staff: "AIKO",
      },
    ],
  });

  const result = await checkRequestedBookingAvailability(db as never, {
    dateValue: "2026-07-13",
    startTime: "10:30",
    duration: 60,
    people: 1,
    staffNames: ["AIKO"],
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "指定された担当者では予約できません。");
});

test("checkRequestedBookingAvailability allows the requested available group", async () => {
  const db = createFakeDb({
    bookings: [
      {
        date: new Date("2026-07-13T12:00:00.000Z"),
        duration: 60,
        staff: "AIKO",
      },
    ],
  });

  const result = await checkRequestedBookingAvailability(db as never, {
    dateValue: "2026-07-13",
    startTime: "10:30",
    duration: 60,
    people: 2,
    staffNames: ["EMI", "AIKO"],
  });

  assert.equal(result.ok, true);
});

test("checkRequestedBookingAvailability rejects requests outside a shift", async () => {
  const db = createFakeDb({
    staff: [
      {
        id: "staff-aiko",
        name: "AIKO",
        active: true,
        startTime: "10:00",
        endTime: "11:00",
      },
    ],
  });

  const result = await checkRequestedBookingAvailability(db as never, {
    dateValue: "2026-07-13",
    startTime: "10:30",
    duration: 60,
    people: 1,
    staffNames: ["AIKO"],
  });

  assert.equal(result.ok, false);
});

test("booking helpers keep pricing and lock order deterministic", () => {
  assert.deepEqual(calculateBookingPrice(60, 2), {
    totalPrice: 18000,
    deposit: 2700,
  });

  assert.deepEqual(combinations(["A", "B", "C"], 2), [
    ["A", "B"],
    ["A", "C"],
    ["B", "C"],
  ]);

  assert.deepEqual(bookingAdvisoryLockKeys("2026-07-13", ["YUNA", "AIKO"]), [
    "booking:2026-07-13:AIKO",
    "booking:2026-07-13:YUNA",
  ]);
});
