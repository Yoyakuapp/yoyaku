import assert from "node:assert/strict";
import test from "node:test";

import { getAdminStoreMembership, getDefaultStore } from "../lib/currentStore";
import {
  buildBookingPaymentIntentMetadata,
  getPaymentIntentStoreId,
} from "../lib/stripePaymentMetadata";
import {
  assertPaymentStoreIdMatches,
  isPaymentBookingConflictError,
} from "../lib/paymentBookings";

test("getDefaultStore returns the first active store", async () => {
  const db = {
    store: {
      findFirst: async () => ({
        id: "store-a",
        isActive: true,
      }),
    },
    storeMember: {
      findFirst: async () => null,
    },
  };

  const store = await getDefaultStore(db as never);

  assert.equal(store.id, "store-a");
});

test("admin store membership only returns stores the admin belongs to", async () => {
  const memberships = [
    {
      adminUserId: "admin-a",
      storeId: "store-a",
      store: {
        id: "store-a",
        isActive: true,
      },
    },
  ];

  const db = {
    store: {
      findFirst: async () => null,
    },
    storeMember: {
      findFirst: async ({ where }: { where: { adminUserId: string } }) =>
        memberships.find((item) => item.adminUserId === where.adminUserId) ??
        null,
    },
  };

  const allowed = await getAdminStoreMembership(db as never, "admin-a");
  const denied = await getAdminStoreMembership(db as never, "admin-b");

  assert.equal(allowed?.store.id, "store-a");
  assert.equal(denied, null);
});

test("payment intent metadata includes storeId", () => {
  const metadata = buildBookingPaymentIntentMetadata({
    storeId: "store-a",
    bookingDate: "2026-07-13",
    bookingTime: "10:30",
    duration: 60,
    people: 2,
  });

  assert.equal(metadata.storeId, "store-a");
  assert.equal(metadata.duration, "60");
  assert.equal(metadata.people, "2");
  assert.equal(getPaymentIntentStoreId(metadata), "store-a");
});

test("payment confirmation rejects mismatched storeId", () => {
  assert.throws(
    () => assertPaymentStoreIdMatches("store-a", "store-b"),
    isPaymentBookingConflictError
  );

  assert.doesNotThrow(() =>
    assertPaymentStoreIdMatches("store-a", "store-a")
  );
});
