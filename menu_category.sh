mkdir -p "prisma"
cat > "prisma/schema.prisma" << 'YOYAKU_EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PaymentAttemptStatus {
  CREATED
  SUCCEEDED
  FAILED
  CANCELLED
  REFUNDED
}

enum StoreMemberRole {
  PLATFORM_ADMIN
  ORGANIZATION_ADMIN
  STORE_MANAGER
  STAFF
}

enum StoreLinkType {
  SISTER
  REGIONAL
}

enum StoreLinkStatus {
  PENDING
  ACCEPTED
  DECLINED
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  stores    Store[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Store {
  id                          String                  @id @default(cuid())
  organizationId              String
  name                        String
  slug                        String                  @unique
  address                     String?
  postalCode                  String?
  city                        String?
  country                     String                  @default("JP")
  latitude                    Float?
  longitude                   Float?
  timezone                    String                  @default("Asia/Tokyo")
  currency                    String                  @default("JPY")
  phone                       String?
  email                       String?
  isActive                    Boolean                 @default(true)
  isPublished                 Boolean                 @default(false)
  stripeAccountId             String?                 @unique
  stripeChargesEnabled        Boolean                 @default(false)
  stripePayoutsEnabled        Boolean                 @default(false)
  stripeDetailsSubmitted      Boolean                 @default(false)
  stripeOnboardingCompletedAt DateTime?
  cancellationPolicy          Json?
  requiresDeposit             Boolean                 @default(false)
  allowPhoneBooking           Boolean                 @default(false)
  allowWhatsappBooking        Boolean                 @default(false)
  allowYoyakuBooking          Boolean                 @default(true)
  whatsappNumber              String?
  description                 String?
  imageUrl                    String?
  imageUrls                   String[]                @default([])
  websiteUrl                  String?
  organization                Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  members                     StoreMember[]
  bookings                    Booking[]
  paymentAttempts             BookingPaymentAttempt[]
  serviceMenus                ServiceMenu[]
  staff                       Staff[]
  businessHours               BusinessHour[]
  businessHourOverrides       BusinessHourOverride[]
  holidays                    Holiday[]
  linksRequested              StoreLink[]             @relation("StoreLinkRequesting")
  linksReceived               StoreLink[]             @relation("StoreLinkTarget")
  createdAt                   DateTime                @default(now())
  updatedAt                   DateTime                @updatedAt

  @@index([organizationId])
  @@index([isActive, isPublished])
}

model StoreMember {
  id          String          @id @default(cuid())
  adminUserId String
  storeId     String
  role        StoreMemberRole @default(STORE_MANAGER)
  adminUser   AdminUser       @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
  store       Store           @relation(fields: [storeId], references: [id], onDelete: Cascade)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@unique([adminUserId, storeId])
  @@index([storeId, role])
}

model Booking {
  id                     String                 @id @default(cuid())
  storeId                String
  serviceMenuId          String?
  bookingNo              String                 @unique
  customer               String
  email                  String
  phone                  String
  memo                   String?
  date                   DateTime
  duration               Int
  people                 Int
  staff                  String
  menu                   String
  amount                 Int
  deposit                Int
  status                 BookingStatus          @default(PENDING)
  stripePaymentIntentId  String?                @unique
  stripeRefundId         String?
  refundedAt             DateTime?
  platformFeeAmount      Int?
  paymentStripeAccountId String?
  store                  Store                  @relation(fields: [storeId], references: [id])
  serviceMenu            ServiceMenu?           @relation(fields: [serviceMenuId], references: [id])
  paymentAttempt         BookingPaymentAttempt?
  createdAt              DateTime               @default(now())
  updatedAt              DateTime               @updatedAt

  @@index([storeId, date])
  @@index([storeId, status])
  @@index([storeId, serviceMenuId])
}

model BookingPaymentAttempt {
  id                     String               @id @default(cuid())
  storeId                String
  serviceMenuId          String?
  stripePaymentIntentId  String               @unique
  customer               String
  email                  String
  phone                  String
  memo                   String?
  date                   DateTime
  duration               Int
  people                 Int
  staff                  String
  menu                   String
  amount                 Int
  deposit                Int
  status                 PaymentAttemptStatus @default(CREATED)
  bookingId              String?              @unique
  platformFeeAmount      Int?
  paymentStripeAccountId String?
  store                  Store                @relation(fields: [storeId], references: [id])
  serviceMenu            ServiceMenu?         @relation(fields: [serviceMenuId], references: [id])
  booking                Booking?             @relation(fields: [bookingId], references: [id])
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt

  @@index([storeId, date])
  @@index([storeId, status])
  @@index([storeId, serviceMenuId])
}

model AdminUser {
  id           String        @id @default(cuid())
  email        String        @unique
  name         String
  passwordHash String
  active       Boolean       @default(true)
  storeMembers StoreMember[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Staff {
  id        String   @id @default(cuid())
  storeId   String
  name      String
  label     String   @default("")
  skills    String[]
  active    Boolean  @default(true)
  store     Store    @relation(fields: [storeId], references: [id])
  shifts    Shift[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([storeId, active])
}

model ServiceMenu {
  id              String                  @id @default(cuid())
  storeId         String
  name            String
  category        String?
  description     String                  @default("")
  durationMinutes Int
  price           Int
  depositAmount   Int?
  depositRate     Int                     @default(15)
  currency        String                  @default("JPY")
  isActive        Boolean                 @default(true)
  displayOrder    Int                     @default(0)
  store           Store                   @relation(fields: [storeId], references: [id], onDelete: Cascade)
  bookings        Booking[]
  paymentAttempts BookingPaymentAttempt[]
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt

  @@index([storeId, isActive, displayOrder])
}

model BusinessHour {
  id        String   @id @default(cuid())
  storeId   String
  dayOfWeek Int
  isClosed  Boolean  @default(false)
  openTime  String
  closeTime String
  store     Store    @relation(fields: [storeId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([storeId, dayOfWeek])
}

model BusinessHourOverride {
  id        String   @id @default(cuid())
  storeId   String
  date      DateTime
  openTime  String
  closeTime String
  store     Store    @relation(fields: [storeId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([storeId, date])
  @@index([storeId, date])
}

model Holiday {
  id        String   @id @default(cuid())
  storeId   String
  date      DateTime
  reason    String   @default("休業日")
  store     Store    @relation(fields: [storeId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([storeId, date])
}

model Shift {
  id        String   @id @default(cuid())
  staffId   String
  date      DateTime
  startTime String
  endTime   String
  isWorking Boolean  @default(true)
  staff     Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([staffId, date])
  @@index([date])
}

model StoreInvite {
  id        String    @id @default(cuid())
  token     String    @unique
  label     String?
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model OperatorNotice {
  id           String   @id @default(cuid())
  title        String
  body         String
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([displayOrder])
}

model StoreLink {
  id                String          @id @default(cuid())
  type              StoreLinkType
  status            StoreLinkStatus @default(PENDING)
  requestingStoreId String
  targetStoreId     String
  requestingStore   Store           @relation("StoreLinkRequesting", fields: [requestingStoreId], references: [id], onDelete: Cascade)
  targetStore       Store           @relation("StoreLinkTarget", fields: [targetStoreId], references: [id], onDelete: Cascade)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@unique([requestingStoreId, targetStoreId, type])
  @@index([targetStoreId, status])
  @@index([requestingStoreId, status])
}

model PlatformSetting {
  id                  String   @id @default("singleton")
  storeNetworkEnabled Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
YOYAKU_EOF

mkdir -p "prisma/migrations/20260719120000_add_service_menu_category"
cat > "prisma/migrations/20260719120000_add_service_menu_category/migration.sql" << 'YOYAKU_EOF'
-- AlterTable
ALTER TABLE "ServiceMenu" ADD COLUMN "category" TEXT;
YOYAKU_EOF

mkdir -p "lib"
cat > "lib/serviceMenus.ts" << 'YOYAKU_EOF'
import type { PrismaClient, ServiceMenu } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type ServiceMenuClient = Pick<PrismaClient, "serviceMenu">;

export type BookingServiceMenu = Pick<
  ServiceMenu,
  | "id"
  | "storeId"
  | "name"
  | "category"
  | "description"
  | "durationMinutes"
  | "price"
  | "depositAmount"
  | "depositRate"
  | "currency"
  | "isActive"
  | "displayOrder"
>;

export type PublicServiceMenu = {
  id: string;
  name: string;
  category: string | null;
  description: string;
  durationMinutes: number;
  price: number;
  deposit: number;
  currency: string;
  isActive: boolean;
  displayOrder: number;
};

export class ServiceMenuError extends Error {
  constructor(
    message: string,
    readonly code: "MENU_NOT_FOUND" | "MENU_INACTIVE"
  ) {
    super(message);
    this.name = "ServiceMenuError";
  }
}

export function calculateServiceMenuDeposit(menu: {
  price: number;
  depositAmount: number | null;
  depositRate: number;
}) {
  if (menu.depositAmount !== null) {
    return menu.depositAmount;
  }

  return Math.round((menu.price * menu.depositRate) / 100);
}

export function toPublicServiceMenu(menu: BookingServiceMenu): PublicServiceMenu {
  return {
    id: menu.id,
    name: menu.name,
    category: menu.category,
    description: menu.description,
    durationMinutes: menu.durationMinutes,
    price: menu.price,
    deposit: calculateServiceMenuDeposit(menu),
    currency: menu.currency,
    isActive: menu.isActive,
    displayOrder: menu.displayOrder,
  };
}

export async function getActiveServiceMenusForStore(
  storeId: string,
  db: ServiceMenuClient = prisma
) {
  const menus = await db.serviceMenu.findMany({
    where: {
      storeId,
      isActive: true,
    },
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return menus.map(toPublicServiceMenu);
}

export async function getServiceMenuForBooking(
  db: ServiceMenuClient,
  input: {
    storeId: string;
    menuId?: string | null;
    duration?: number | null;
  }
): Promise<BookingServiceMenu> {
  const menu = input.menuId
    ? await db.serviceMenu.findFirst({
        where: {
          id: input.menuId,
          storeId: input.storeId,
        },
      })
    : await db.serviceMenu.findFirst({
        where: {
          storeId: input.storeId,
          isActive: true,
          ...(input.duration
            ? {
                durationMinutes: input.duration,
              }
            : {}),
        },
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      });

  if (!menu) {
    throw new ServiceMenuError(
      "メニューが見つかりません。",
      "MENU_NOT_FOUND"
    );
  }

  if (!menu.isActive) {
    throw new ServiceMenuError(
      "このメニューは現在予約できません。",
      "MENU_INACTIVE"
    );
  }

  return menu;
}

export function getServiceMenuBookingPrice(menu: BookingServiceMenu) {
  return {
    totalPrice: menu.price,
    deposit: calculateServiceMenuDeposit(menu),
  };
}
YOYAKU_EOF

mkdir -p "app/api/service-menus/[id]"
cat > "app/api/service-menus/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { getDefaultStore, isStoreResolutionError } from "@/lib/currentStore";
import { prisma } from "@/lib/prisma";
import {
  getActiveServiceMenusForStore,
  toPublicServiceMenu,
} from "@/lib/serviceMenus";

const serviceMenuCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z
    .string()
    .trim()
    .max(60)
    .nullable()
    .optional()
    .transform((value) => (value ? value : null)),
  description: z.string().trim().max(500).optional().default(""),
  durationMinutes: z.number().int().min(15).max(480),
  price: z.number().int().min(0).max(10_000_000),
  depositRate: z.number().int().min(0).max(100).optional().default(15),
  depositAmount: z.number().int().min(0).max(10_000_000).nullable().optional(),
  currency: z.string().trim().length(3).optional().default("JPY"),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).max(10_000).optional().default(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  if (includeInactive) {
    const { response, store } = await requireAdminApiStore();

    if (response) {
      return response;
    }

    const menus = await prisma.serviceMenu.findMany({
      where: {
        storeId: store.id,
      },
      orderBy: [
        {
          displayOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return NextResponse.json(menus.map(toPublicServiceMenu));
  }

  try {
    const store = await getDefaultStore();
    const menus = await getActiveServiceMenusForStore(store.id);

    return NextResponse.json(menus);
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    return NextResponse.json(
      {
        error: "メニューを取得できませんでした。",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const json = await request.json().catch(() => null);
  const parsed = serviceMenuCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "メニューの入力内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const menu = await prisma.serviceMenu.create({
    data: {
      ...parsed.data,
      currency: parsed.data.currency.toUpperCase(),
      storeId: store.id,
    },
  });

  return NextResponse.json(toPublicServiceMenu(menu), {
    status: 201,
  });
}
YOYAKU_EOF

cat > "app/api/service-menus/[id]/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";
import { toPublicServiceMenu } from "@/lib/serviceMenus";

const serviceMenuUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  category: z
    .string()
    .trim()
    .max(60)
    .nullable()
    .optional()
    .transform((value) => (value === undefined ? undefined : value || null)),
  description: z.string().trim().max(500).optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  price: z.number().int().min(0).max(10_000_000).optional(),
  depositRate: z.number().int().min(0).max(100).optional(),
  depositAmount: z.number().int().min(0).max(10_000_000).nullable().optional(),
  currency: z.string().trim().length(3).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(10_000).optional(),
});

type ServiceMenuRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: ServiceMenuRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const json = await request.json().catch(() => null);
  const parsed = serviceMenuUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "メニューの入力内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const existingMenu = await prisma.serviceMenu.findFirst({
    where: {
      id,
      storeId: store.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingMenu) {
    return NextResponse.json(
      {
        error: "メニューが見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  const menu = await prisma.serviceMenu.update({
    where: {
      id,
    },
    data: {
      ...parsed.data,
      ...(parsed.data.currency
        ? {
            currency: parsed.data.currency.toUpperCase(),
          }
        : {}),
    },
  });

  return NextResponse.json(toPublicServiceMenu(menu));
}
YOYAKU_EOF

mkdir -p "app/admin/menu"
cat > "app/admin/menu/page.tsx" << 'YOYAKU_EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";

type ServiceMenu = {
  id: string;
  name: string;
  category: string | null;
  description: string;
  durationMinutes: number;
  price: number;
  deposit: number;
  currency: string;
  isActive: boolean;
  displayOrder: number;
};

type MenuForm = {
  name: string;
  category: string;
  description: string;
  durationMinutes: string;
  price: string;
  depositRate: string;
  displayOrder: string;
};

const emptyForm: MenuForm = {
  name: "",
  category: "",
  description: "",
  durationMinutes: "60",
  price: "9000",
  depositRate: "15",
  displayOrder: "0",
};

function normalizeDigits(value: string) {
  const halfWidth = value.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );

  return halfWidth.replace(/[^0-9]/g, "");
}

function parseIntField(value: string): number | null {
  const normalized = normalizeDigits(value.trim());

  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function toForm(menu: ServiceMenu): MenuForm {
  return {
    name: menu.name,
    category: menu.category ?? "",
    description: menu.description,
    durationMinutes: String(menu.durationMinutes),
    price: String(menu.price),
    depositRate:
      menu.price > 0 ? String(Math.round((menu.deposit / menu.price) * 100)) : "0",
    displayOrder: String(menu.displayOrder),
  };
}

type ValidatedMenuPayload = {
  name: string;
  category: string | null;
  description: string;
  durationMinutes: number;
  price: number;
  depositRate: number;
  currency: string;
  displayOrder: number;
};

function validateForm(form: MenuForm): ValidatedMenuPayload | string {
  const name = form.name.trim();

  if (!name) {
    return "メニュー名を入力してください。";
  }

  const durationMinutes = parseIntField(form.durationMinutes);

  if (durationMinutes === null || durationMinutes < 15 || durationMinutes > 480) {
    return "時間は15〜480の数字で入力してください。";
  }

  const price = parseIntField(form.price);

  if (price === null || price < 0) {
    return "料金は0以上の数字で入力してください。";
  }

  const depositRate = parseIntField(form.depositRate);

  if (depositRate === null || depositRate < 0 || depositRate > 100) {
    return "予約金率は0〜100の数字で入力してください。";
  }

  const displayOrder = parseIntField(form.displayOrder) ?? 0;

  return {
    name,
    category: form.category.trim() || null,
    description: form.description.trim(),
    durationMinutes,
    price,
    depositRate,
    currency: "JPY",
    displayOrder,
  };
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<ServiceMenu[]>([]);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [editingForm, setEditingForm] = useState<MenuForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMenus() {
      const response = await fetch("/api/service-menus?includeInactive=true", {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | ServiceMenu[]
        | { error?: string }
        | null;

      if (!isMounted) {
        return;
      }

      if (!response.ok || !Array.isArray(data)) {
        setMessage(
          data && !Array.isArray(data) && data.error
            ? data.error
            : "メニューの読み込みに失敗しました。"
        );
        setMessageIsError(true);
        setIsLoading(false);
        return;
      }

      setMenus(data);
      setIsLoading(false);
    }

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, []);

  async function createMenu() {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(form);

    if (typeof validated === "string") {
      setMessage(validated);
      setMessageIsError(true);
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch("/api/service-menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated),
    });

    const data = (await response.json().catch(() => null)) as
      | ServiceMenu
      | { error?: string }
      | null;

    if (!response.ok || !data || !("id" in data)) {
      setMessage(
        data && "error" in data && data.error
          ? data.error
          : "メニューの作成に失敗しました。"
      );
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setMenus((current) => [...current, data]);
    setForm(emptyForm);
    setMessage("メニューを作成しました。");
    setMessageIsError(false);
    setIsSubmitting(false);
  }

  async function saveEdit(id: string) {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(editingForm);

    if (typeof validated === "string") {
      setMessage(validated);
      setMessageIsError(true);
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch(`/api/service-menus/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated),
    });

    const data = (await response.json().catch(() => null)) as
      | ServiceMenu
      | { error?: string }
      | null;

    if (!response.ok || !data || !("id" in data)) {
      setMessage(
        data && "error" in data && data.error
          ? data.error
          : "メニューの更新に失敗しました。"
      );
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setMenus((current) =>
      current.map((menu) => (menu.id === id ? data : menu))
    );
    setEditingId("");
    setMessage("メニューを更新しました。");
    setMessageIsError(false);
    setIsSubmitting(false);
  }

  async function toggleActive(menu: ServiceMenu) {
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch(`/api/service-menus/${menu.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: !menu.isActive,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | ServiceMenu
      | { error?: string }
      | null;

    if (!response.ok || !data || !("id" in data)) {
      setMessage(
        data && "error" in data && data.error
          ? data.error
          : "メニューの更新に失敗しました。"
      );
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setMenus((current) =>
      current.map((m) => (m.id === menu.id ? data : m))
    );
    setIsSubmitting(false);
  }

  function updateForm(
    setter: (value: MenuForm) => void,
    current: MenuForm,
    field: keyof MenuForm,
    value: string
  ) {
    setter({
      ...current,
      [field]: value,
    });
  }

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            メニュー管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            施術メニュー、時間、料金、予約金を店舗単位で管理します。
          </p>
        </Card>

        {message ? (
          <Card>
            <p
              className={
                messageIsError
                  ? "text-sm font-bold text-red-700"
                  : "text-sm font-bold text-green-800"
              }
            >
              {message}
            </p>
          </Card>
        ) : null}

        <Card className="space-y-3">
          <p className="text-xs leading-5 text-stone-500">
            「カテゴリー」に同じ名前(例: タイマッサージ)を複数のメニューに設定すると、予約ページでそのカテゴリーごとにまとめて表示され、お客様は時間・料金を選べるようになります。空欄のままでも問題ありません。
          </p>

          {isLoading ? (
            <p className="text-sm text-stone-500">読み込み中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-bold text-stone-500">
                    <th className="py-2 pr-3">メニュー名</th>
                    <th className="py-2 pr-3">カテゴリー</th>
                    <th className="py-2 pr-3">時間(分)</th>
                    <th className="py-2 pr-3">料金(¥)</th>
                    <th className="py-2 pr-3">予約金率(%)</th>
                    <th className="py-2 pr-3">表示順</th>
                    <th className="py-2 pr-3">状態</th>
                    <th className="py-2 pr-3">操作</th>
                  </tr>
                </thead>

                <tbody>
                  {menus.map((menu) => {
                    const isEditing = editingId === menu.id;
                    const rowForm = isEditing ? editingForm : toForm(menu);

                    return (
                      <tr
                        key={menu.id}
                        className="border-b border-stone-100 align-middle"
                      >
                        {isEditing ? (
                          <>
                            <td className="py-2 pr-3">
                              <input
                                value={rowForm.name}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                value={rowForm.category}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "category",
                                    e.target.value
                                  )
                                }
                                placeholder="例: タイマッサージ"
                                className="w-32 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.durationMinutes}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "durationMinutes",
                                    e.target.value
                                  )
                                }
                                className="w-20 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.price}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className="w-24 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.depositRate}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "depositRate",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                inputMode="numeric"
                                value={rowForm.displayOrder}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "displayOrder",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 pr-3 font-bold text-stone-900">
                              {menu.name}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              {menu.category || (
                                <span className="text-stone-300">未設定</span>
                              )}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              {menu.durationMinutes}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              ¥{menu.price.toLocaleString()}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              {menu.price > 0
                                ? Math.round((menu.deposit / menu.price) * 100)
                                : 0}
                            </td>
                            <td className="py-2 pr-3 text-stone-700">
                              {menu.displayOrder}
                            </td>
                          </>
                        )}

                        <td className="py-2 pr-3">
                          <span
                            className={
                              menu.isActive
                                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                                : "rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500"
                            }
                          >
                            {menu.isActive ? "表示中" : "停止中"}
                          </span>
                        </td>

                        <td className="py-2 pr-3">
                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => saveEdit(menu.id)}
                                  className="rounded-xl border border-green-800 px-3 py-1.5 text-xs font-bold text-green-800 disabled:opacity-50"
                                >
                                  保存
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId("")}
                                  className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700"
                                >
                                  中止
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(menu.id);
                                    setEditingForm(toForm(menu));
                                  }}
                                  className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-700"
                                >
                                  編集
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmitting}
                                  onClick={() => toggleActive(menu)}
                                  className="rounded-xl border border-green-800 px-3 py-1.5 text-xs font-bold text-green-800 disabled:opacity-50"
                                >
                                  {menu.isActive ? "停止" : "表示"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  <tr className="align-middle">
                    <td className="py-2 pr-3">
                      <input
                        value={form.name}
                        onChange={(e) =>
                          updateForm(setForm, form, "name", e.target.value)
                        }
                        placeholder="新しいメニュー名"
                        className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        value={form.category}
                        onChange={(e) =>
                          updateForm(setForm, form, "category", e.target.value)
                        }
                        placeholder="例: タイマッサージ"
                        className="w-32 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.durationMinutes}
                        onChange={(e) =>
                          updateForm(
                            setForm,
                            form,
                            "durationMinutes",
                            e.target.value
                          )
                        }
                        className="w-20 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.price}
                        onChange={(e) =>
                          updateForm(setForm, form, "price", e.target.value)
                        }
                        className="w-24 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.depositRate}
                        onChange={(e) =>
                          updateForm(
                            setForm,
                            form,
                            "depositRate",
                            e.target.value
                          )
                        }
                        className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        inputMode="numeric"
                        value={form.displayOrder}
                        onChange={(e) =>
                          updateForm(
                            setForm,
                            form,
                            "displayOrder",
                            e.target.value
                          )
                        }
                        className="w-16 rounded-xl border border-stone-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="py-2 pr-3" />
                    <td className="py-2 pr-3">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => createMenu()}
                        className="rounded-xl border border-green-800 bg-green-800 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        追加
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <p className="mb-2 font-bold">説明文(新規メニュー用)</p>

          <textarea
            value={form.description}
            onChange={(e) =>
              updateForm(setForm, form, "description", e.target.value)
            }
            rows={3}
            placeholder="表の「追加」ボタンで作成するメニューの説明文(任意)"
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
          />
        </Card>
      </div>
    </AdminFrame>
  );
}
YOYAKU_EOF

mkdir -p "app/s/[slug]/booking"
cat > "app/s/[slug]/booking/page.tsx" << 'YOYAKU_EOF'
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import MobileFrame from "@/components/layout/MobileFrame";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";
import PhotoGallery from "@/components/booking/PhotoGallery";

type When = "今すぐ" | "今日" | "後日";

type ServiceMenu = {
  id: string;
  name: string;
  category: string | null;
  description: string;
  durationMinutes: number;
  price: number;
  deposit: number;
  currency: string;
};

const UNCATEGORIZED_KEY = "";
const UNCATEGORIZED_LABEL = "その他";

type StoreInfo = {
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function StoreBookingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [when, setWhen] = useState<When>("今すぐ");
  const [date, setDate] = useState(getTodayDate());
  const [duration, setDuration] = useState(60);
  const [menuId, setMenuId] = useState("");
  const [menus, setMenus] = useState<ServiceMenu[]>([]);
  const [menuError, setMenuError] = useState("");
  const [people, setPeople] = useState(1);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(UNCATEGORIZED_KEY);

  useEffect(() => {
    let isMounted = true;

    async function loadStore() {
      const response = await fetch(`/api/public/stores/${slug}`, {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | StoreInfo
        | null;

      if (!isMounted || !response.ok || !data) {
        return;
      }

      setStore(data);
    }

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    async function loadMenus() {
      const response = await fetch(`/api/public/stores/${slug}/service-menus`, {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | ServiceMenu[]
        | { error?: string }
        | null;

      if (!isMounted) {
        return;
      }

      if (!response.ok || !Array.isArray(data)) {
        setMenuError(
          data && !Array.isArray(data) && data.error
            ? data.error
            : "メニューを取得できませんでした。"
        );
        return;
      }

      setMenus(data);

      const firstMenu = data[0];

      if (firstMenu) {
        setMenuId(firstMenu.id);
        setDuration(firstMenu.durationMinutes);
        setSelectedCategory(firstMenu.category?.trim() || UNCATEGORIZED_KEY);
      }
    }

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const menusByCategory = useMemo(() => {
    const map = new Map<string, ServiceMenu[]>();

    for (const menu of menus) {
      const key = menu.category?.trim() || UNCATEGORIZED_KEY;
      const group = map.get(key) ?? [];
      group.push(menu);
      map.set(key, group);
    }

    return map;
  }, [menus]);

  const categoryKeys = Array.from(menusByCategory.keys());
  const showCategorySelector = categoryKeys.length > 1;
  const visibleMenus = showCategorySelector
    ? menusByCategory.get(selectedCategory) ?? []
    : menus;

  function selectCategory(key: string) {
    setSelectedCategory(key);

    const firstInCategory = menusByCategory.get(key)?.[0];

    if (firstInCategory) {
      setMenuId(firstInCategory.id);
      setDuration(firstInCategory.durationMinutes);
    }
  }

  const selectedDate = when === "後日" ? date : getTodayDate();

  const params2 = new URLSearchParams({
    when,
    date: selectedDate,
    duration: String(duration),
    people: String(people),
  });

  if (menuId) {
    params2.set("menuId", menuId);
  }

  const availabilityUrl = `/s/${slug}/booking/availability?${params2.toString()}`;

  return (
    <MobileFrame>
      <div className="space-y-4 pb-32 pt-4">
        {store ? (
          <div className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5">
            {(() => {
              const galleryUrls =
                store.imageUrls.length > 0
                  ? store.imageUrls
                  : store.imageUrl
                    ? [store.imageUrl]
                    : [];

              return (
                <PhotoGallery
                  images={galleryUrls}
                  alt={store.name}
                  heightClassName="h-40"
                />
              );
            })()}

            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-lg font-bold text-stone-900">
                  {store.name}
                </h1>

                <Link
                  href="/login"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-800 px-3 py-1.5 text-xs font-bold text-green-800 transition active:scale-[0.98]"
                >
                  お店の方はこちら
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {store.description ? (
                <p className="text-sm leading-relaxed text-stone-600">
                  {store.description}
                </p>
              ) : null}

              {store.address || store.phone || store.websiteUrl ? (
                <div className="space-y-2.5 border-t border-stone-100 pt-4 text-sm">
                  {store.address ? (
                    <div className="flex items-start gap-2.5 text-stone-600">
                      <Icon
                        name="location"
                        className="mt-0.5 h-4 w-4 shrink-0 text-stone-400"
                      />
                      <p>{store.address}</p>
                    </div>
                  ) : null}

                  {store.phone ? (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex items-center gap-2.5 text-stone-600 transition active:opacity-70"
                    >
                      <Icon name="phone" className="h-4 w-4 shrink-0 text-stone-400" />
                      <span className="underline decoration-stone-300 underline-offset-2">
                        {store.phone}
                      </span>
                    </a>
                  ) : null}

                  {store.websiteUrl ? (
                    <a
                      href={store.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 font-bold text-green-800"
                    >
                      <Icon name="chevron-right" className="h-4 w-4 shrink-0" />
                      {store.websiteUrl}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white p-4 shadow-md ring-1 ring-black/5">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="mt-4 h-5 w-2/3" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {(["今すぐ", "今日", "後日"] as When[]).map((label) => (
            <Button
              key={label}
              variant={when === label ? "primary" : "secondary"}
              onClick={() => setWhen(label)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Card className="space-y-5">
          <h2 className="text-2xl font-bold text-stone-900">予約内容</h2>

          {when === "後日" ? (
            <div>
              <label
                htmlFor="booking-date"
                className="text-sm font-bold text-stone-700"
              >
                予約日
              </label>

              <input
                id="booking-date"
                type="date"
                value={date}
                min={getTodayDate()}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
              />
            </div>
          ) : null}

          <div className="space-y-4">
            <h3 className="flex items-center gap-1.5 text-xl font-bold text-stone-800">
              <Icon name="star" className="h-4 w-4 text-stone-400" />
              メニュー
            </h3>

            {menuError ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {menuError}
              </p>
            ) : menus.length > 0 ? (
              <div className="space-y-4">
                {showCategorySelector ? (
                  <div className="flex flex-wrap gap-2">
                    {categoryKeys.map((key) => (
                      <button
                        key={key || "__uncategorized__"}
                        type="button"
                        onClick={() => selectCategory(key)}
                        className={
                          selectedCategory === key
                            ? "rounded-full border border-green-800 bg-green-800 px-4 py-2 text-sm font-bold text-white"
                            : "rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700"
                        }
                      >
                        {key || UNCATEGORIZED_LABEL}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-3">
                  {visibleMenus.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => {
                        setMenuId(menu.id);
                        setDuration(menu.durationMinutes);
                      }}
                      className={
                        menuId === menu.id
                          ? "w-full rounded-2xl border border-green-800 bg-green-800 px-4 py-3 text-left text-white"
                          : "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left text-stone-900"
                      }
                    >
                      <span className="block font-bold">{menu.name}</span>
                      <span className="mt-1 flex items-center gap-1 text-sm opacity-80">
                        <Icon name="clock" className="h-3.5 w-3.5" />
                        {menu.durationMinutes}分・¥{menu.price.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            )}
          </div>

          <div className="border-t border-stone-200 pt-5">
            <div className="space-y-4">
              <h3 className="flex items-center gap-1.5 text-xl font-bold text-stone-800">
                <Icon name="users" className="h-4 w-4 text-stone-400" />
                何人で受けますか？
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((count) => (
                  <Button
                    key={count}
                    variant={people === count ? "primary" : "secondary"}
                    onClick={() => setPeople(count)}
                  >
                    {count}人
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-stone-100 via-stone-100/95 to-transparent pb-6 pt-8">
          <div className="w-full max-w-[398px] px-4">
            <Link href={availabilityUrl}>
              <Button size="lg">空き時間を見る</Button>
            </Link>
          </div>
        </div>

        <p className="pb-16 text-center text-sm text-stone-500">
          Powered by <span className="font-bold text-stone-800">Yoyaku</span>
        </p>
      </div>
    </MobileFrame>
  );
}
YOYAKU_EOF

mkdir -p "tests"
cat > "tests/serviceMenus.test.ts" << 'YOYAKU_EOF'
import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateServiceMenuDeposit,
  getServiceMenuBookingPrice,
  getServiceMenuForBooking,
  ServiceMenuError,
} from "../lib/serviceMenus";

const activeMenu = {
  id: "menu-active",
  storeId: "store-a",
  name: "タイ古式マッサージ 60分",
  category: null,
  description: "",
  durationMinutes: 60,
  price: 9000,
  depositAmount: null,
  depositRate: 15,
  currency: "JPY",
  isActive: true,
  displayOrder: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

test("service menu deposit uses fixed amount when configured", () => {
  assert.equal(
    calculateServiceMenuDeposit({
      price: 12000,
      depositAmount: 3000,
      depositRate: 15,
    }),
    3000
  );
});

test("service menu booking price is derived from database menu values", () => {
  assert.deepEqual(getServiceMenuBookingPrice(activeMenu), {
    totalPrice: 9000,
    deposit: 1350,
  });
});

test("service menu lookup rejects inactive menu reservations", async () => {
  const db = {
    serviceMenu: {
      findFirst: async () => ({
        ...activeMenu,
        isActive: false,
      }),
    },
  };

  await assert.rejects(
    () =>
      getServiceMenuForBooking(db as never, {
        storeId: "store-a",
        menuId: "menu-inactive",
      }),
    (error: unknown) =>
      error instanceof ServiceMenuError && error.code === "MENU_INACTIVE"
  );
});
YOYAKU_EOF
