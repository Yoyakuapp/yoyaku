import assert from "node:assert/strict";
import test from "node:test";

import { createAdminLoginOtp, verifyAdminLoginOtp } from "../lib/adminLoginOtp";

function createFakeOtpDb() {
  const otps: {
    id: string;
    adminUserId: string;
    codeHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
    createdAt: Date;
  }[] = [];

  return {
    otps,
    adminLoginOtp: {
      create: async ({
        data,
      }: {
        data: { adminUserId: string; codeHash: string; expiresAt: Date };
      }) => {
        const record = {
          id: `otp-${otps.length + 1}`,
          consumedAt: null,
          createdAt: new Date(),
          ...data,
        };
        otps.push(record);
        return record;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { adminUserId: string; consumedAt: null };
        data: { consumedAt: Date };
      }) => {
        let count = 0;

        for (const record of otps) {
          if (
            record.adminUserId === where.adminUserId &&
            record.consumedAt === where.consumedAt
          ) {
            record.consumedAt = data.consumedAt;
            count += 1;
          }
        }

        return { count };
      },
      findFirst: async ({
        where,
      }: {
        where: {
          adminUserId: string;
          consumedAt: null;
          expiresAt: { gte: Date };
        };
      }) => {
        const candidates = otps
          .filter(
            (record) =>
              record.adminUserId === where.adminUserId &&
              record.consumedAt === where.consumedAt &&
              record.expiresAt >= where.expiresAt.gte
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return candidates[0] ?? null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { consumedAt: Date };
      }) => {
        const record = otps.find((item) => item.id === where.id);

        if (record) {
          record.consumedAt = data.consumedAt;
        }

        return record;
      },
    },
  };
}

test("a freshly created otp verifies successfully and only once", async () => {
  const db = createFakeOtpDb();
  const code = await createAdminLoginOtp("admin-1", db as never);

  assert.equal(code.length, 6);
  assert.match(code, /^[0-9]{6}$/);

  const firstAttempt = await verifyAdminLoginOtp("admin-1", code, db as never);
  assert.equal(firstAttempt, true);

  const secondAttempt = await verifyAdminLoginOtp("admin-1", code, db as never);
  assert.equal(secondAttempt, false);
});

test("verifyAdminLoginOtp rejects a wrong code without consuming the real one", async () => {
  const db = createFakeOtpDb();
  const code = await createAdminLoginOtp("admin-1", db as never);

  const wrongAttempt = await verifyAdminLoginOtp("admin-1", "000000", db as never);
  assert.equal(wrongAttempt, false);

  const correctAttempt = await verifyAdminLoginOtp("admin-1", code, db as never);
  assert.equal(correctAttempt, true);
});

test("verifyAdminLoginOtp rejects an expired code", async () => {
  const db = createFakeOtpDb();
  const code = await createAdminLoginOtp("admin-1", db as never);

  db.otps[0].expiresAt = new Date(Date.now() - 1000);

  const result = await verifyAdminLoginOtp("admin-1", code, db as never);
  assert.equal(result, false);
});

test("requesting a new otp invalidates the previous unconsumed one", async () => {
  const db = createFakeOtpDb();
  const firstCode = await createAdminLoginOtp("admin-1", db as never);
  const secondCode = await createAdminLoginOtp("admin-1", db as never);

  const firstStillValid = await verifyAdminLoginOtp(
    "admin-1",
    firstCode,
    db as never
  );
  assert.equal(firstStillValid, false);

  const secondValid = await verifyAdminLoginOtp(
    "admin-1",
    secondCode,
    db as never
  );
  assert.equal(secondValid, true);
});

test("otps are isolated per admin user", async () => {
  const db = createFakeOtpDb();
  const code = await createAdminLoginOtp("admin-1", db as never);

  const result = await verifyAdminLoginOtp("admin-2", code, db as never);
  assert.equal(result, false);
});

