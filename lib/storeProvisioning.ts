import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 12;

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const storeProvisioningSchema = z.object({
  organizationName: z.string().trim().min(1),
  storeName: z.string().trim().min(1),
  slug: z.string().trim().toLowerCase().regex(slugPattern, {
    message: "半角小文字・数字・ハイフンのみ使用できます。",
  }),
  ownerEmail: z.string().trim().toLowerCase().email(),
  ownerName: z.string().trim().min(1),
  ownerPassword: z.string().min(12),
  allowPhoneBooking: z.boolean().default(false),
  allowWhatsappBooking: z.boolean().default(false),
  allowYoyakuBooking: z.boolean().default(true),
  whatsappNumber: z.string().trim().min(1).nullable().default(null),
  inviteToken: z.string().trim().min(1).optional(),
});

export type StoreProvisioningInput = z.input<typeof storeProvisioningSchema>;

export type StoreProvisioningResult = {
  organizationId: string;
  storeId: string;
  slug: string;
  adminUserId: string;
  email: string;
};

export class StoreProvisioningError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_INPUT"
      | "SLUG_ALREADY_EXISTS"
      | "EMAIL_ALREADY_EXISTS"
      | "INVALID_INVITE"
  ) {
    super(message);
    this.name = "StoreProvisioningError";
  }
}

function mapPrismaError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = (error.meta?.target as string[] | undefined) ?? [];

    if (target.includes("slug")) {
      throw new StoreProvisioningError(
        "このスラッグは既に使用されています。",
        "SLUG_ALREADY_EXISTS"
      );
    }

    throw new StoreProvisioningError(
      "このメールアドレスは既に登録されています。",
      "EMAIL_ALREADY_EXISTS"
    );
  }

  throw error;
}

export async function createStoreWithOwner(
  input: StoreProvisioningInput
): Promise<StoreProvisioningResult> {
  const parsed = storeProvisioningSchema.safeParse(input);

  if (!parsed.success) {
    throw new StoreProvisioningError(
      "入力内容が正しくありません。",
      "INVALID_INPUT"
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.ownerPassword, BCRYPT_ROUNDS);

  try {
    return await prisma.$transaction(
      async (tx) => {
        if (parsed.data.inviteToken) {
          const invite = await tx.storeInvite.findUnique({
            where: {
              token: parsed.data.inviteToken,
            },
          });

          if (!invite || invite.usedAt) {
            throw new StoreProvisioningError(
              "この招待リンクは無効か、既に使用されています。",
              "INVALID_INVITE"
            );
          }

          await tx.storeInvite.update({
            where: {
              id: invite.id,
            },
            data: {
              usedAt: new Date(),
            },
          });
        }

        const organization = await tx.organization.create({
          data: {
            name: parsed.data.organizationName,
          },
        });

        const store = await tx.store.create({
          data: {
            organizationId: organization.id,
            name: parsed.data.storeName,
            slug: parsed.data.slug,
            isActive: true,
            isPublished: false,
            allowPhoneBooking: parsed.data.allowPhoneBooking,
            allowWhatsappBooking: parsed.data.allowWhatsappBooking,
            allowYoyakuBooking: parsed.data.allowYoyakuBooking,
            whatsappNumber: parsed.data.whatsappNumber,
          },
        });

        const adminUser = await tx.adminUser.create({
          data: {
            email: parsed.data.ownerEmail,
            name: parsed.data.ownerName,
            passwordHash,
            active: true,
          },
        });

        await tx.storeMember.create({
          data: {
            adminUserId: adminUser.id,
            storeId: store.id,
            role: "STORE_MANAGER",
          },
        });

        return {
          organizationId: organization.id,
          storeId: store.id,
          slug: store.slug,
          adminUserId: adminUser.id,
          email: adminUser.email,
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
