import assert from "node:assert/strict";
import test from "node:test";

import {
  assertRefundableBooking,
  assertValidBookingTransition,
  BookingLifecycleError,
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

test("refund requires confirmed unpaid-refunded booking with payment intent", () => {
  assert.doesNotThrow(() =>
    assertRefundableBooking({
      status: "CONFIRMED",
      stripePaymentIntentId: "pi_test",
      refundedAt: null,
    })
  );

  assert.throws(
    () =>
      assertRefundableBooking({
        status: "CANCELLED",
        stripePaymentIntentId: "pi_test",
        refundedAt: null,
      }),
    BookingLifecycleError
  );
});
