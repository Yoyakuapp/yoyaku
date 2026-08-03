import assert from "node:assert/strict";
import test from "node:test";

import {
  clearLoginAttempts,
  isLockedOut,
  recordFailedLoginAttempt,
} from "../lib/loginAttempts";

function createFakeLoginAttemptDb() {
  const attempts: { scope: string; identifier: string; createdAt: Date }[] = [];

  return {
    loginAttempt: {
      count: async ({
        where,
      }: {
        where: {
          scope: string;
          identifier: string;
          createdAt: { gte: Date };
        };
      }) =>
        attempts.filter(
          (attempt) =>
            attempt.scope === where.scope &&
            attempt.identifier === where.identifier &&
            attempt.createdAt >= where.createdAt.gte
        ).length,
      create: async ({
        data,
      }: {
        data: { scope: string; identifier: string };
      }) => {
        const record = { ...data, createdAt: new Date() };
        attempts.push(record);
        return { id: `attempt-${attempts.length}`, ...record };
      },
      deleteMany: async ({
        where,
      }: {
        where: { scope: string; identifier: string };
      }) => {
        const before = attempts.length;

        for (let index = attempts.length - 1; index >= 0; index -= 1) {
          if (
            attempts[index].scope === where.scope &&
            attempts[index].identifier === where.identifier
          ) {
            attempts.splice(index, 1);
          }
        }

        return { count: before - attempts.length };
      },
    },
  };
}

test("isLockedOut is false until the threshold of failed attempts is reached", async () => {
  const db = createFakeLoginAttemptDb();

  for (let attempt = 0; attempt < 9; attempt += 1) {
    assert.equal(await isLockedOut("ADMIN_LOGIN", "user@example.com", db as never), false);
    await recordFailedLoginAttempt("ADMIN_LOGIN", "user@example.com", db as never);
  }

  assert.equal(
    await isLockedOut("ADMIN_LOGIN", "user@example.com", db as never),
    false
  );

  await recordFailedLoginAttempt("ADMIN_LOGIN", "user@example.com", db as never);

  assert.equal(
    await isLockedOut("ADMIN_LOGIN", "user@example.com", db as never),
    true
  );
});

test("clearLoginAttempts resets the lockout for that identifier", async () => {
  const db = createFakeLoginAttemptDb();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await recordFailedLoginAttempt("OPERATOR", "203.0.113.1", db as never);
  }

  assert.equal(await isLockedOut("OPERATOR", "203.0.113.1", db as never), true);

  await clearLoginAttempts("OPERATOR", "203.0.113.1", db as never);

  assert.equal(await isLockedOut("OPERATOR", "203.0.113.1", db as never), false);
});

test("attempts are isolated per scope and identifier", async () => {
  const db = createFakeLoginAttemptDb();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await recordFailedLoginAttempt("ADMIN_LOGIN", "user@example.com", db as never);
  }

  assert.equal(
    await isLockedOut("ADMIN_LOGIN", "user@example.com", db as never),
    true
  );
  assert.equal(
    await isLockedOut("OPERATOR", "user@example.com", db as never),
    false
  );
  assert.equal(
    await isLockedOut("ADMIN_LOGIN", "someone-else@example.com", db as never),
    false
  );
});

