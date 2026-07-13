import assert from "node:assert/strict";
import test from "node:test";

import {
  AdminProvisioningError,
  createInitialAdminUser,
  upsertStoreManagerAdminUser,
} from "../lib/adminProvisioning";

function createDb(overrides: {
  adminCount?: number;
  duplicateEmail?: boolean;
  existingAdmin?: { id: string; email: string } | null;
  store?: { id: string } | null;
} = {}) {
  const calls: string[] = [];
  const existingAdmin =
    overrides.existingAdmin ??
    (overrides.duplicateEmail
      ? { id: "admin-existing", email: "owner@example.com" }
      : null);
  const state = {
    adminUser: {
      count: async () => overrides.adminCount ?? 0,
      findUnique: async () => existingAdmin,
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
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: {
          name: string;
          passwordHash: string;
          active: boolean;
        };
      }) => {
        calls.push(
          `admin-update:${where.id}:${data.name}:${data.passwordHash}:${data.active}`
        );

        return {
          id: where.id,
          email: existingAdmin?.email ?? "owner@example.com",
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
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: {
          adminUserId_storeId: {
            adminUserId: string;
            storeId: string;
          };
        };
        create: {
          adminUserId: string;
          storeId: string;
          role: string;
        };
        update: {
          role: string;
        };
      }) => {
        calls.push(
          `member-upsert:${where.adminUserId_storeId.adminUserId}:${where.adminUserId_storeId.storeId}:${create.role}:${update.role}`
        );

        return {
          id: "member-upserted",
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

test("store manager admin provisioning creates a target admin and default store membership", async () => {
  const { calls, db } = createDb();

  const result = await upsertStoreManagerAdminUser(
    {
      email: " Admin@Yoyakus.COM ",
      name: "Masa Ogawa",
      password: "safe-password-123",
    },
    {
      db: db as never,
      hashPassword: async () => "hashed-password",
    }
  );

  assert.deepEqual(result, {
    adminUserId: "admin-created",
    email: "admin@yoyakus.com",
    storeId: "store-default",
    role: "STORE_MANAGER",
    action: "created",
  });
  assert.deepEqual(calls, [
    "admin:admin@yoyakus.com:hashed-password",
    "member-upsert:admin-created:store-default:STORE_MANAGER:STORE_MANAGER",
  ]);
});

test("store manager admin provisioning updates an existing target admin without creating a duplicate", async () => {
  const { calls, db } = createDb({
    existingAdmin: {
      id: "admin-existing",
      email: "admin@yoyakus.com",
    },
  });

  const result = await upsertStoreManagerAdminUser(
    {
      email: "admin@yoyakus.com",
      name: "Masa Ogawa",
      password: "safe-password-123",
    },
    {
      db: db as never,
      hashPassword: async () => "hashed-password",
    }
  );

  assert.deepEqual(result, {
    adminUserId: "admin-existing",
    email: "admin@yoyakus.com",
    storeId: "store-default",
    role: "STORE_MANAGER",
    action: "updated",
  });
  assert.deepEqual(calls, [
    "admin-update:admin-existing:Masa Ogawa:hashed-password:true",
    "member-upsert:admin-existing:store-default:STORE_MANAGER:STORE_MANAGER",
  ]);
});
