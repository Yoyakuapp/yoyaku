import assert from "node:assert/strict";
import test from "node:test";

import {
  AdminProvisioningError,
  createInitialAdminUser,
} from "../lib/adminProvisioning";

function createDb(overrides: {
  adminCount?: number;
  duplicateEmail?: boolean;
  store?: { id: string } | null;
} = {}) {
  const calls: string[] = [];
  const state = {
    adminUser: {
      count: async () => overrides.adminCount ?? 0,
      findUnique: async () =>
        overrides.duplicateEmail ? { id: "admin-existing" } : null,
      create: async ({
        data,
      }: {
        data: {
          email: string;
          name: string;
          passwordHash: string;
          active: boolean;
        };
      }) => {
        calls.push(`admin:${data.email}:${data.passwordHash}`);

        return {
          id: "admin-created",
          email: data.email,
        };
      },
    },
    store: {
      findFirst: async () => overrides.store ?? { id: "store-default" },
    },
    storeMember: {
      create: async ({
        data,
      }: {
        data: {
          adminUserId: string;
          storeId: string;
          role: string;
        };
      }) => {
        calls.push(
          `member:${data.adminUserId}:${data.storeId}:${data.role}`
        );

        return {
          id: "member-created",
        };
      },
    },
  };

  return {
    calls,
    db: {
      ...state,
      $transaction: async <T>(
        callback: (tx: typeof state) => Promise<T>
      ) => callback(state),
    },
  };
}

test("initial admin provisioning creates admin and store membership in a transaction", async () => {
  const { calls, db } = createDb();

  const result = await createInitialAdminUser(
    {
      email: " Owner@Example.COM ",
      name: " Owner ",
      password: "secure-password-123",
    },
    {
      db: db as never,
      hashPassword: async () => "hashed-password",
    }
  );

  assert.deepEqual(result, {
    adminUserId: "admin-created",
    email: "owner@example.com",
    storeId: "store-default",
    role: "STORE_MANAGER",
  });
  assert.deepEqual(calls, [
    "admin:owner@example.com:hashed-password",
    "member:admin-created:store-default:STORE_MANAGER",
  ]);
});

test("initial admin provisioning rejects duplicate email before hashing", async () => {
  const { db } = createDb({
    duplicateEmail: true,
  });
  let hashCalled = false;

  await assert.rejects(
    () =>
      createInitialAdminUser(
        {
          email: "owner@example.com",
          name: "Owner",
          password: "secure-password-123",
        },
        {
          db: db as never,
          hashPassword: async () => {
            hashCalled = true;
            return "hashed-password";
          },
        }
      ),
    (error: unknown) =>
      error instanceof AdminProvisioningError &&
      error.code === "EMAIL_ALREADY_EXISTS"
  );

  assert.equal(hashCalled, false);
});

test("initial admin provisioning refuses when an admin already exists", async () => {
  const { db } = createDb({
    adminCount: 1,
  });

  await assert.rejects(
    () =>
      createInitialAdminUser(
        {
          email: "owner@example.com",
          name: "Owner",
          password: "secure-password-123",
        },
        {
          db: db as never,
          hashPassword: async () => "hashed-password",
        }
      ),
    (error: unknown) =>
      error instanceof AdminProvisioningError &&
      error.code === "ADMIN_ALREADY_EXISTS"
  );
});
