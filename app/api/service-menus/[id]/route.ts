import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";
import { toPublicServiceMenu } from "@/lib/serviceMenus";

const serviceMenuUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
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
