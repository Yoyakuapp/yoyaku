import type { PrismaClient, ServiceMenu } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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
  categoryNameEn: string | null;
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

export function toPublicServiceMenu(
  menu: BookingServiceMenu,
  categoryNameEn: string | null = null
): PublicServiceMenu {
  return {
    id: menu.id,
    name: menu.name,
    category: menu.category,
    categoryNameEn,
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

  const categoryNameEnByName = new Map(
    categories.map((category) => [category.name, category.nameEn])
  );

  return menus.map((menu) =>
    toPublicServiceMenu(
      menu,
      menu.category ? (categoryNameEnByName.get(menu.category) ?? null) : null
    )
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
