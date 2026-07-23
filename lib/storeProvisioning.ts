import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { STAFF_GENDER_OPTIONS } from "@/lib/staffGender";

const BCRYPT_ROUNDS = 12;

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const businessHoursDraftSchema = z.object({
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  closedDays: z.array(z.number().int().min(0).max(6)),
});

const staffDraftSchema = z.object({
  name: z.string().trim().min(1),
  gender: z.enum(STAFF_GENDER_OPTIONS).nullable().default(null),
});

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
  adminLocale: z.enum(SUPPORTED_LOCALES).default(DEFAULT_LOCALE),
  inviteToken: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).nullable().default(null),
  phone: z.string().trim().min(1).nullable().default(null),
  websiteUrl: z.string().trim().min(1).nullable().default(null),
  staff: z.array(staffDraftSchema).max(30).default([]),
  businessHours: businessHoursDraftSchema.nullable().default(null),
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
            adminLocale: parsed.data.adminLocale,
            address: parsed.data.address,
            phone: parsed.data.phone,
            websiteUrl: parsed.data.websiteUrl,
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

        if (parsed.data.staff.length > 0) {
          await tx.staff.createMany({
            data: parsed.data.staff.map(({ name, gender }) => ({
              storeId: store.id,
              name,
              gender,
            })),
          });
        }

        if (parsed.data.businessHours) {
          const { openTime, closeTime, closedDays } = parsed.data.businessHours;

          await tx.businessHour.createMany({
            data: Array.from({ length: 7 }, (_, dayOfWeek) => ({
              storeId: store.id,
              dayOfWeek,
              isClosed: closedDays.includes(dayOfWeek),
              openTime,
              closeTime,
            })),
          });
        }

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
