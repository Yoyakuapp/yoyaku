import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";

import { applyAccountStatusToStore } from "../lib/stripeConnect";

function createFakeStore(overrides: {
  id: string;
  stripeAccountId: string;
  stripeOnboardingCompletedAt: Date | null;
}) {
  const store = {
    ...overrides,
    stripeChargesEnabled: false,
    stripePayoutsEnabled: false,
    stripeDetailsSubmitted: false,
  };

  return {
    db: {
      findUnique: async ({
        where,
      }: {
        where: { stripeAccountId: string };
      }) => (store.stripeAccountId === where.stripeAccountId ? store : null),
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<typeof store>;
      }) => {
        assert.equal(where.id, store.id);
        Object.assign(store, data);
        return store;
      },
    },
    store,
  };
}

function fakeAccount(overrides: Partial<Stripe.Account>): Stripe.Account {
  return {
    id: "acct_test",
    charges_enabled: false,
    payouts_enabled: false,
    details_submitted: false,
    ...overrides,
  } as Stripe.Account;
}

test("applyAccountStatusToStore returns null when no store matches the account", async () => {
  const { db } = createFakeStore({
    id: "store-1",
    stripeAccountId: "acct_other",
    stripeOnboardingCompletedAt: null,
  });

  const result = await applyAccountStatusToStore(
    fakeAccount({ id: "acct_test" }),
    { store: db } as never
  );

  assert.equal(result, null);
});

test("applyAccountStatusToStore copies charges/payouts/details flags from the Stripe account", async () => {
  const { db } = createFakeStore({
    id: "store-1",
    stripeAccountId: "acct_test",
    stripeOnboardingCompletedAt: null,
  });

  const result = await applyAccountStatusToStore(
    fakeAccount({
      id: "acct_test",
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: false,
    }),
    { store: db } as never
  );

  assert.equal(result?.stripeChargesEnabled, true);
  assert.equal(result?.stripePayoutsEnabled, true);
  assert.equal(result?.stripeDetailsSubmitted, false);
});

test("applyAccountStatusToStore sets stripeOnboardingCompletedAt the first time details are submitted", async () => {
  const { db } = createFakeStore({
    id: "store-1",
    stripeAccountId: "acct_test",
    stripeOnboardingCompletedAt: null,
  });

  const result = await applyAccountStatusToStore(
    fakeAccount({ id: "acct_test", details_submitted: true }),
    { store: db } as never
  );

  assert.ok(result?.stripeOnboardingCompletedAt instanceof Date);
});

test("applyAccountStatusToStore never overwrites an already-recorded onboarding completion date", async () => {
  const firstCompletedAt = new Date("2026-01-01T00:00:00.000Z");
  const { db } = createFakeStore({
    id: "store-1",
    stripeAccountId: "acct_test",
    stripeOnboardingCompletedAt: firstCompletedAt,
  });

  const result = await applyAccountStatusToStore(
    fakeAccount({ id: "acct_test", details_submitted: true }),
    { store: db } as never
  );

  assert.equal(result?.stripeOnboardingCompletedAt, firstCompletedAt);
});

