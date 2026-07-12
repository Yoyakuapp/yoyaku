import assert from "node:assert/strict";
import test from "node:test";

import {
  bookingAdvisoryLockKeys,
  bookingOverlaps,
  calculateBookingPrice,
  getAvailabilityForDate,
  checkRequestedBookingAvailability,
  combinations,
} from "../lib/serverBookingAvailability";

function createFakeDb(options: {
  isClosed?: boolean;
  closedStoreIds?: string[];
  bookings?: Array<{
    storeId?: string;
    date: Date;
    duration: number;
    staff: string;
  }>;
  staff?: Array<{
    id: string;
    storeId?: string;
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
      findUnique: async ({ where }: {
        where: { storeId_date: { storeId: string; date: Date } };
      }) =>
        options.closedStoreIds?.includes(where.storeId_date.storeId)
          ? {
              reason: "店舗別休業日",
            }
          : null,
    },
    businessHour: {
      findUnique: async ({ where }: {
        where: { storeId_dayOfWeek: { storeId: string; dayOfWeek: number } };
      }) => ({
        dayOfWeek: where.storeId_dayOfWeek.dayOfWeek,
        isClosed:
          options.isClosed && where.storeId_dayOfWeek.storeId === "store-a",
        openTime:
          where.storeId_dayOfWeek.storeId === "store-b" ? "12:00" : "10:00",
        closeTime:
          where.storeId_dayOfWeek.storeId === "store-b" ? "18:00" : "20:00",
      }),
    },
    shift: {
      findMany: async ({ where }: {
        where: {
          date: Date;
          isWorking: boolean;
          staff: {
            storeId: string;
            active: boolean;
            name?: string;
          };
        };
      }) =>
        staff
          .filter(
            (person) =>
              person.active &&
              (person.storeId ?? "store-a") === where.staff.storeId &&
              (!where.staff.name || person.name === where.staff.name)
          )
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
      findMany: async ({ where }: {
        where: {
          storeId: string;
        };
      }) =>
        (options.bookings ?? []).filter(
          (booking) => (booking.storeId ?? "store-a") === where.storeId
        ),
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
    storeId: "store-a",
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
    storeId: "store-a",
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
    storeId: "store-a",
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

  assert.deepEqual(bookingAdvisoryLockKeys("store-a", "2026-07-13", ["YUNA", "AIKO"]), [
    "booking:store-a:2026-07-13:AIKO",
    "booking:store-a:2026-07-13:YUNA",
  ]);
});

test("availability is scoped by store business hours", async () => {
  const db = createFakeDb({});

  const storeA = await getAvailabilityForDate(db as never, {
    storeId: "store-a",
    dateValue: "2026-07-13",
    duration: 60,
    people: 1,
  });

  const storeB = await getAvailabilityForDate(db as never, {
    storeId: "store-b",
    dateValue: "2026-07-13",
    duration: 60,
    people: 1,
  });

  assert.equal(storeA.openTime, "10:00");
  assert.equal(storeB.openTime, "12:00");
});

test("availability is scoped by store holidays", async () => {
  const db = createFakeDb({
    closedStoreIds: ["store-b"],
  });

  const storeA = await getAvailabilityForDate(db as never, {
    storeId: "store-a",
    dateValue: "2026-07-13",
    duration: 60,
    people: 1,
  });

  const storeB = await getAvailabilityForDate(db as never, {
    storeId: "store-b",
    dateValue: "2026-07-13",
    duration: 60,
    people: 1,
  });

  assert.equal(storeA.isClosed, false);
  assert.equal(storeB.isClosed, true);
  assert.equal(storeB.closedReason, "店舗別休業日");
});

test("availability is scoped by store staff, shifts, and bookings", async () => {
  const db = createFakeDb({
    staff: [
      {
        id: "staff-aiko",
        storeId: "store-a",
        name: "AIKO",
        active: true,
        startTime: "10:00",
        endTime: "20:00",
      },
      {
        id: "staff-emi",
        storeId: "store-b",
        name: "EMI",
        active: true,
        startTime: "12:00",
        endTime: "18:00",
      },
    ],
    bookings: [
      {
        storeId: "store-a",
        date: new Date("2026-07-13T12:00:00.000Z"),
        duration: 60,
        staff: "AIKO",
      },
    ],
  });

  const storeB = await getAvailabilityForDate(db as never, {
    storeId: "store-b",
    dateValue: "2026-07-13",
    duration: 60,
    people: 1,
  });

  assert.equal(storeB.slots[0].time, "12:00");
  assert.equal(storeB.slots[0].availableStaff[0].name, "EMI");
});
