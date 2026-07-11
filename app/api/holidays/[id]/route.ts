import { NextResponse } from "next/server";

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
  const { id } = await context.params;

  const holiday = await prisma.holiday.findUnique({
    where: {
      id,
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
    },
  });

  return NextResponse.json({
    success: true,
  });
}