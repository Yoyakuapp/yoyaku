import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

type MenuCategoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateCategorySchema = z.object({
  nameEn: z.string().trim().max(60).nullable(),
});

export async function PATCH(
  request: Request,
  context: MenuCategoryRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const json = await request.json().catch(() => null);
  const parsed = updateCategorySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "入力内容を確認してください。",
      },
      {
        status: 400,
      }
    );
  }

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

  const category = await prisma.menuCategory.update({
    where: {
      id,
    },
    data: {
      nameEn: parsed.data.nameEn,
    },
  });

  return NextResponse.json(category);
}

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
