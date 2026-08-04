import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";

import { authenticateAdminUser } from "../lib/auth";
import { createAdminLoginOtp } from "../lib/adminLoginOtp";

function createAuthDb(adminUser: {
  id: string;
  email: string;
  name: string;
  active: boolean;
  passwordHash: string;
}) {
  const attempts: { scope: string; identifier: string; createdAt: Date }[] = [];
  const otps: {
    id: string;
    adminUserId: string;
    codeHash: string;
    expiresAt: Date;
    consumedAt: Date | null;
    createdAt: Date;
  }[] = [];

  return {
    adminUser: {
      findFirst: async ({
        where,
        select,
      }: {
        where: { email: { equals: string; mode: "insensitive" } };
        select: Record<string, boolean>;
      }) => {
        assert.deepEqual(select, {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          active: true,
        });

        if (
          where.email.mode === "insensitive" &&
          adminUser.email.toLowerCase() === where.email.equals.toLowerCase()
        ) {
          return adminUser;
        }

        return null;
      },
    },
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

test("admin authentication compares submitted password with stored passwordHash and requires a valid otp", async () => {
  const passwordHash = await bcrypt.hash("secure-password-123", 4);
  const db = createAuthDb({
    id: "admin-1",
    email: "admin@yoyakus.test",
    name: "Admin",
    active: true,
    passwordHash,
  });

  const withoutOtp = await authenticateAdminUser(
    {
      email: " ADMIN@YOYAKUS.TEST ",
      password: "secure-password-123",
    },
    db as never
  );

  assert.equal(withoutOtp, null);

  const code = await createAdminLoginOtp("admin-1", db as never);

  const withWrongOtp = await authenticateAdminUser(
    {
      email: " ADMIN@YOYAKUS.TEST ",
      password: "secure-password-123",
      otp: "000000",
    },
    db as never
  );

  assert.equal(withWrongOtp, null);

  const user = await authenticateAdminUser(
    {
      email: " ADMIN@YOYAKUS.TEST ",
      password: "secure-password-123",
      otp: code,
    },
    db as never
  );

  assert.deepEqual(user, {
    id: "admin-1",
    email: "admin@yoyakus.test",
    name: "Admin",
  });
});

test("admin authentication rejects inactive users and invalid passwords", async () => {
  const passwordHash = await bcrypt.hash("secure-password-123", 4);

  const inactiveUser = await authenticateAdminUser(
    {
      email: "admin@yoyakus.test",
      password: "secure-password-123",
    },
    createAuthDb({
      id: "admin-1",
      email: "admin@yoyakus.test",
      name: "Admin",
      active: false,
      passwordHash,
    }) as never
  );

  const wrongPassword = await authenticateAdminUser(
    {
      email: "admin@yoyakus.test",
      password: "wrong-password",
    },
    createAuthDb({
      id: "admin-1",
      email: "admin@yoyakus.test",
      name: "Admin",
      active: true,
      passwordHash,
    }) as never
  );

  assert.equal(inactiveUser, null);
  assert.equal(wrongPassword, null);
});

test("admin authentication locks out an account after repeated failed attempts", async () => {
  const passwordHash = await bcrypt.hash("secure-password-123", 4);
  const db = createAuthDb({
    id: "admin-1",
    email: "admin@yoyakus.test",
    name: "Admin",
    active: true,
    passwordHash,
  });

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const result = await authenticateAdminUser(
      {
        email: "admin@yoyakus.test",
        password: "wrong-password",
      },
      db as never
    );

    assert.equal(result, null);
  }

  const lockedOutWithCorrectPassword = await authenticateAdminUser(
    {
      email: "admin@yoyakus.test",
      password: "secure-password-123",
    },
    db as never
  );

  assert.equal(lockedOutWithCorrectPassword, null);
});


