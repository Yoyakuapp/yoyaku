import assert from "node:assert/strict";
import test from "node:test";

import {
  assertRefundableBooking,
  assertValidBookingTransition,
  BookingLifecycleError,
  isRefundWindowOpen,
} from "../lib/bookingLifecycle";

test("booking lifecycle allows confirmed booking completion", () => {
  assert.doesNotThrow(() =>
    assertValidBookingTransition("CONFIRMED", "COMPLETED")
  );
});

test("booking lifecycle rejects completed booking cancellation", () => {
  assert.throws(
    () => assertValidBookingTransition("COMPLETED", "CANCELLED"),
    BookingLifecycleError
  );
});

test("refund window closes within 24 hours before booking", () => {
  assert.equal(
    isRefundWindowOpen(
      new Date("2026-07-14T10:00:00.000Z"),
      new Date("2026-07-13T09:59:59.000Z")
    ),
    true
  );
  assert.equal(
    isRefundWindowOpen(
      new Date("2026-07-14T10:00:00.000Z"),
      new Date("2026-07-13T10:00:01.000Z")
    ),
    false
  );
});

test("refund requires confirmed unpaid-refunded booking with payment intent", () => {
  assert.doesNotThrow(() =>
    assertRefundableBooking({
      status: "CONFIRMED",
      bookingDate: new Date("2026-07-14T10:00:00.000Z"),
      stripePaymentIntentId: "pi_test",
      refundedAt: null,
      now: new Date("2026-07-13T09:00:00.000Z"),
    })
  );

  assert.throws(
    () =>
      assertRefundableBooking({
        status: "CANCELLED",
        bookingDate: new Date("2026-07-14T10:00:00.000Z"),
        stripePaymentIntentId: "pi_test",
        refundedAt: null,
        now: new Date("2026-07-13T09:00:00.000Z"),
      }),
    BookingLifecycleError
  );
});
