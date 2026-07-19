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
