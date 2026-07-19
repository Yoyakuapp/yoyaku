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
