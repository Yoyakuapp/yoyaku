import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import type { PrismaClient, StoreMemberRole } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 12;
const DEFAULT_ROLE: StoreMemberRole = "STORE_MANAGER";

const adminProvisioningSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1),
  password: z.string().min(12),
});

type AdminProvisioningInput = z.input<typeof adminProvisioningSchema>;

type AdminProvisioningDb = Pick<
  PrismaClient,
  "$transaction" | "adminUser" | "store" | "storeMember"
>;

type AdminProvisioningDependencies = {
  db?: AdminProvisioningDb;
  hashPassword?: (password: string) => Promise<string>;
};

export type AdminProvisioningResult = {
  adminUserId: string;
  email: string;
  storeId: string;
  role: StoreMemberRole;
  action?: "created" | "updated";
};

export class AdminProvisioningError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_INPUT"
      | "ADMIN_ALREADY_EXISTS"
      | "EMAIL_ALREADY_EXISTS"
      | "STORE_NOT_FOUND"
      | "CONFLICT"
  ) {
    super(message);
    this.name = "AdminProvisioningError";
  }
}

function mapPrismaError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AdminProvisioningError(
      "このメールアドレスは既に登録されています。",
      "EMAIL_ALREADY_EXISTS"
    );
  }

  throw error;
}

export async function createInitialAdminUser(
  input: AdminProvisioningInput,
  dependencies: AdminProvisioningDependencies = {}
): Promise<AdminProvisioningResult> {
  const parsed = adminProvisioningSchema.safeParse(input);

  if (!parsed.success) {
    throw new AdminProvisioningError(
      "管理者アカウントの入力内容が正しくありません。",
      "INVALID_INPUT"
    );
  }

  const db = dependencies.db ?? prisma;
  const hashPassword =
    dependencies.hashPassword ??
    ((password: string) => bcrypt.hash(password, BCRYPT_ROUNDS));

  const existingAdminCount = await db.adminUser.count();

  if (existingAdminCount > 0) {
    throw new AdminProvisioningError(
      "管理者アカウントは既に作成されています。",
      "ADMIN_ALREADY_EXISTS"
    );
  }

  const existingEmail = await db.adminUser.findUnique({
    where: {
      email: parsed.data.email,
    },
    select: {
      id: true,
    },
  });

  if (existingEmail) {
    throw new AdminProvisioningError(
      "このメールアドレスは既に登録されています。",
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    return await db.$transaction(
      async (tx) => {
        const adminCount = await tx.adminUser.count();

        if (adminCount > 0) {
          throw new AdminProvisioningError(
            "管理者アカウントは既に作成されています。",
            "ADMIN_ALREADY_EXISTS"
          );
        }

        const duplicateEmail = await tx.adminUser.findUnique({
          where: {
            email: parsed.data.email,
          },
          select: {
            id: true,
          },
        });

        if (duplicateEmail) {
          throw new AdminProvisioningError(
            "このメールアドレスは既に登録されています。",
            "EMAIL_ALREADY_EXISTS"
          );
        }

        const store = await tx.store.findFirst({
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
          },
        });

        if (!store) {
          throw new AdminProvisioningError(
            "有効な店舗が設定されていません。",
            "STORE_NOT_FOUND"
          );
        }

        const adminUser = await tx.adminUser.create({
          data: {
            email: parsed.data.email,
            name: parsed.data.name,
            passwordHash,
            active: true,
          },
          select: {
            id: true,
            email: true,
          },
        });

        await tx.storeMember.create({
          data: {
            adminUserId: adminUser.id,
            storeId: store.id,
            role: DEFAULT_ROLE,
          },
        });

        return {
          adminUserId: adminUser.id,
          email: adminUser.email,
          storeId: store.id,
          role: DEFAULT_ROLE,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function upsertStoreManagerAdminUser(
  input: AdminProvisioningInput,
  dependencies: AdminProvisioningDependencies = {}
): Promise<AdminProvisioningResult> {
  const parsed = adminProvisioningSchema.safeParse(input);

  if (!parsed.success) {
    throw new AdminProvisioningError(
      "管理者アカウントの入力内容が正しくありません。",
      "INVALID_INPUT"
    );
  }

  const db = dependencies.db ?? prisma;
  const hashPassword =
    dependencies.hashPassword ??
    ((password: string) => bcrypt.hash(password, BCRYPT_ROUNDS));
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    return await db.$transaction(
      async (tx) => {
        const store = await tx.store.findFirst({
          where: {
            isActive: true,
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
          },
        });

        if (!store) {
          throw new AdminProvisioningError(
            "有効な店舗が設定されていません。",
            "STORE_NOT_FOUND"
          );
        }

        const existingAdmin = await tx.adminUser.findUnique({
          where: {
            email: parsed.data.email,
          },
          select: {
            id: true,
          },
        });

        const adminUser = existingAdmin
          ? await tx.adminUser.update({
              where: {
                id: existingAdmin.id,
              },
              data: {
                name: parsed.data.name,
                passwordHash,
                active: true,
              },
              select: {
                id: true,
                email: true,
              },
            })
          : await tx.adminUser.create({
              data: {
                email: parsed.data.email,
                name: parsed.data.name,
                passwordHash,
                active: true,
              },
              select: {
                id: true,
                email: true,
              },
            });

        await tx.storeMember.upsert({
          where: {
            adminUserId_storeId: {
              adminUserId: adminUser.id,
              storeId: store.id,
            },
          },
          create: {
            adminUserId: adminUser.id,
            storeId: store.id,
            role: DEFAULT_ROLE,
          },
          update: {
            role: DEFAULT_ROLE,
          },
        });

        return {
          adminUserId: adminUser.id,
          email: adminUser.email,
          storeId: store.id,
          role: DEFAULT_ROLE,
          action: existingAdmin ? "updated" : "created",
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  } catch (error) {
    mapPrismaError(error);
  }
}
