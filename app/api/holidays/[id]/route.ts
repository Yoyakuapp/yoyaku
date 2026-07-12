import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

type HolidayRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  context: HolidayRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const holiday = await prisma.holiday.findUnique({
    where: {
      id,
      storeId: store.id,
    },
    select: {
      id: true,
    },
  });

  if (!holiday) {
    return NextResponse.json(
      {
        error: "休業日が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  await prisma.holiday.delete({
    where: {
      id,
      storeId: store.id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
