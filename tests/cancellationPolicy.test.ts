import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateRefundPercent,
  parseCancellationPolicy,
} from "../lib/cancellationPolicy";

test("default policy refunds in full up to 24 hours before, otherwise nothing", () => {
  const bookingDate = new Date("2026-07-14T10:00:00.000Z");

  assert.equal(
    calculateRefundPercent(null, bookingDate, new Date("2026-07-13T09:59:59.000Z")),
    100
  );
  assert.equal(
    calculateRefundPercent(null, bookingDate, new Date("2026-07-13T10:00:01.000Z")),
    0
  );
});

test("tiered policy applies the highest satisfied tier", () => {
  const bookingDate = new Date("2026-07-14T12:00:00.000Z");
  const policy = [
    { hoursBefore: 24, refundPercent: 100 },
    { hoursBefore: 12, refundPercent: 50 },
    { hoursBefore: 6, refundPercent: 30 },
  ];

  assert.equal(
    calculateRefundPercent(policy, bookingDate, new Date("2026-07-13T11:00:00.000Z")),
    100
  );
  assert.equal(
    calculateRefundPercent(policy, bookingDate, new Date("2026-07-13T23:30:00.000Z")),
    50
  );
  assert.equal(
    calculateRefundPercent(policy, bookingDate, new Date("2026-07-14T05:30:00.000Z")),
    30
  );
  assert.equal(
    calculateRefundPercent(policy, bookingDate, new Date("2026-07-14T11:00:00.000Z")),
    0
  );
});

test("parseCancellationPolicy accepts only well-formed tiers", () => {
  assert.deepEqual(
    parseCancellationPolicy([
      { hoursBefore: 24, refundPercent: 100 },
      { hoursBefore: 12, refundPercent: 50 },
    ]),
    [
      { hoursBefore: 24, refundPercent: 100 },
      { hoursBefore: 12, refundPercent: 50 },
    ]
  );

  assert.equal(parseCancellationPolicy(null), null);
  assert.equal(parseCancellationPolicy([]), null);
  assert.equal(
    parseCancellationPolicy([{ hoursBefore: -1, refundPercent: 50 }]),
    null
  );
  assert.equal(
    parseCancellationPolicy([{ hoursBefore: 24, refundPercent: 150 }]),
    null
  );
});
