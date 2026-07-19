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
  menuCategories              MenuCategory[]
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

model MenuCategory {
  id           String   @id @default(cuid())
  storeId      String
  name         String
  displayOrder Int      @default(0)
  store        Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([storeId, name])
  @@index([storeId, displayOrder])
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

mkdir -p "prisma/migrations/20260719140000_add_menu_category"
cat > "prisma/migrations/20260719140000_add_menu_category/migration.sql" << 'YOYAKU_EOF'
-- CreateTable
CREATE TABLE "MenuCategory" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuCategory_storeId_name_key" ON "MenuCategory"("storeId", "name");

-- CreateIndex
CREATE INDEX "MenuCategory_storeId_displayOrder_idx" ON "MenuCategory"("storeId", "displayOrder");

-- AddForeignKey
ALTER TABLE "MenuCategory" ADD CONSTRAINT "MenuCategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
YOYAKU_EOF

mkdir -p "app/api/menu-categories/[id]"
cat > "app/api/menu-categories/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const categories = await prisma.menuCategory.findMany({
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

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const json = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "カテゴリー名を入力してください。",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const category = await prisma.menuCategory.create({
      data: {
        storeId: store.id,
        name: parsed.data.name,
      },
    });

    return NextResponse.json(category, {
      status: 201,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "同じ名前のカテゴリーが既にあります。",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: "カテゴリーの作成に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}
YOYAKU_EOF

cat > "app/api/menu-categories/[id]/route.ts" << 'YOYAKU_EOF'
import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

type MenuCategoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: MenuCategoryRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const existingCategory = await prisma.menuCategory.findFirst({
    where: {
      id,
      storeId: store.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingCategory) {
    return NextResponse.json(
      {
        error: "カテゴリーが見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  await prisma.menuCategory.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}
YOYAKU_EOF

mkdir -p "app/admin/menu"
cat > "app/admin/menu/page.tsx" << 'YOYAKU_EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";

type MenuCategory = {
  id: string;
  name: string;
  displayOrder: number;
};

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
  categoryId: string;
  description: string;
  durationMinutes: string;
  price: string;
  depositRate: string;
  displayOrder: string;
};

const emptyForm: MenuForm = {
  categoryId: "",
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

function toForm(menu: ServiceMenu, categories: MenuCategory[]): MenuForm {
  return {
    categoryId: categories.find((c) => c.name === menu.category)?.id ?? "",
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

function validateForm(
  form: MenuForm,
  categories: MenuCategory[]
): ValidatedMenuPayload | string {
  const category = categories.find((c) => c.id === form.categoryId);

  if (!category) {
    return "施術メニューを選択してください。";
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
    name: `${category.name} ${durationMinutes}分`,
    category: category.name,
    description: form.description.trim(),
    durationMinutes,
    price,
    depositRate,
    currency: "JPY",
    displayOrder,
  };
}

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
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

    async function loadCategories() {
      const response = await fetch("/api/menu-categories", {
        cache: "no-store",
      });

      const data = (await response.json().catch(() => null)) as
        | MenuCategory[]
        | { error?: string }
        | null;

      if (!isMounted || !response.ok || !Array.isArray(data)) {
        return;
      }

      setCategories(data);
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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

  async function createCategory() {
    const name = newCategoryName.trim();

    if (!name || isSubmitting) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch("/api/menu-categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | MenuCategory
      | { error?: string }
      | null;

    if (!response.ok || !data || !("id" in data)) {
      setMessage(
        data && "error" in data && data.error
          ? data.error
          : "カテゴリーの作成に失敗しました。"
      );
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setCategories((current) => [...current, data]);
    setNewCategoryName("");
    setIsSubmitting(false);
  }

  async function deleteCategory(id: string) {
    if (isSubmitting) {
      return;
    }

    setMessage("");
    setMessageIsError(false);
    setIsSubmitting(true);

    const response = await fetch(`/api/menu-categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      setMessage(data?.error ?? "カテゴリーの削除に失敗しました。");
      setMessageIsError(true);
      setIsSubmitting(false);
      return;
    }

    setCategories((current) => current.filter((c) => c.id !== id));
    setIsSubmitting(false);
  }

  async function createMenu() {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(form, categories);

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
    setForm((current) => ({
      ...emptyForm,
      categoryId: current.categoryId,
    }));
    setMessage("メニューを作成しました。");
    setMessageIsError(false);
    setIsSubmitting(false);
  }

  async function saveEdit(id: string) {
    if (isSubmitting) {
      return;
    }

    const validated = validateForm(editingForm, categories);

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
          <p className="font-bold text-stone-900">
            あなたのお店にはどんなメニューがありますか？
          </p>

          <p className="text-xs leading-5 text-stone-500">
            例: 全身マッサージ、足裏マッサージ、オイルマッサージ、全身＋足裏、オイル＋足裏、など
          </p>

          <div className="flex gap-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="例: 全身マッサージ"
              className="w-full rounded-xl border border-stone-200 px-3 py-2"
            />

            <button
              type="button"
              disabled={isSubmitting || !newCategoryName.trim()}
              onClick={() => createCategory()}
              className="shrink-0 rounded-xl border border-green-800 bg-green-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              追加
            </button>
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-800"
                >
                  {category.name}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => deleteCategory(category.id)}
                    aria-label={`${category.name}を削除`}
                    className="text-green-800/60 transition hover:text-green-800 disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">
              まだメニューが登録されていません。上の欄から追加してください。
            </p>
          )}
        </Card>

        <Card>
          {isLoading ? (
            <p className="text-sm text-stone-500">読み込み中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-bold text-stone-500">
                    <th className="py-2 pr-3">施術メニュー</th>
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
                    const rowForm = isEditing
                      ? editingForm
                      : toForm(menu, categories);

                    return (
                      <tr
                        key={menu.id}
                        className="border-b border-stone-100 align-middle"
                      >
                        {isEditing ? (
                          <>
                            <td className="py-2 pr-3">
                              <select
                                value={rowForm.categoryId}
                                onChange={(e) =>
                                  updateForm(
                                    setEditingForm,
                                    rowForm,
                                    "categoryId",
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                              >
                                <option value="">選択してください</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
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
                                    setEditingForm(toForm(menu, categories));
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
                      <select
                        value={form.categoryId}
                        onChange={(e) =>
                          updateForm(setForm, form, "categoryId", e.target.value)
                        }
                        className="w-full rounded-xl border border-stone-200 px-2 py-1.5"
                      >
                        <option value="">施術メニューを選択</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
                        disabled={isSubmitting || categories.length === 0}
                        onClick={() => createMenu()}
                        className="rounded-xl border border-green-800 bg-green-800 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        追加
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {categories.length === 0 ? (
                <p className="mt-2 text-xs text-stone-400">
                  施術時間・料金を追加する前に、上の欄で施術メニューを登録してください。
                </p>
              ) : null}
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
