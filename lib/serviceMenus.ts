import type { PrismaClient, ServiceMenu } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translation";
import type { Locale } from "@/lib/i18n/locales";

type ServiceMenuClient = Pick<PrismaClient, "serviceMenu" | "menuCategory">;

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
  db: ServiceMenuClient = prisma,
  options: { locale?: Locale; adminLocale?: string } = {}
) {
  const [menus, categories] = await Promise.all([
    db.serviceMenu.findMany({
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
    }),
    db.menuCategory.findMany({
      where: {
        storeId,
      },
      select: {
        name: true,
        nameEn: true,
      },
    }),
  ]);

  const publicMenus = menus.map((menu) => toPublicServiceMenu(menu));

  const { locale, adminLocale = "ja" } = options;

  if (!locale || locale === adminLocale) {
    return publicMenus;
  }

  const categoryNameEnByName = new Map(
    categories.map((category) => [category.name, category.nameEn])
  );

  return Promise.all(
    publicMenus.map(async (menu) => {
      const manualCategoryNameEn = menu.category
        ? categoryNameEnByName.get(menu.category)
        : null;

      const translatedCategory =
        menu.category && locale === "en" && manualCategoryNameEn
          ? manualCategoryNameEn
          : menu.category
            ? await translateText(menu.category, locale)
            : null;

      return {
        ...menu,
        name: await translateText(menu.name, locale),
        category: translatedCategory,
      };
    })
  );
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
