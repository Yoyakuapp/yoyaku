import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";

import { authenticateAdminUser } from "../lib/auth";

function createAuthDb(adminUser: {
  id: string;
  email: string;
  name: string;
  active: boolean;
  passwordHash: string;
}) {
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
  };
}

test("admin authentication compares submitted password with stored passwordHash", async () => {
  const passwordHash = await bcrypt.hash("secure-password-123", 4);
  const db = createAuthDb({
    id: "admin-1",
    email: "admin@yoyakus.test",
    name: "Admin",
    active: true,
    passwordHash,
  });

  const user = await authenticateAdminUser(
    {
      email: " ADMIN@YOYAKUS.TEST ",
      password: "secure-password-123",
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
