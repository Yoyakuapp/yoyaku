import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";

const updateStaffSchema = z.object({
  name: z.string().trim().min(1).optional(),
  label: z.string().trim().optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  active: z.boolean().optional(),
});

type StaffRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: StaffRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const staff = await prisma.staff.findUnique({
    where: {
      id,
      storeId: store.id,
    },
  });

  if (!staff) {
    return NextResponse.json(
      {
        error: "施術者が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json(staff);
}

export async function PATCH(
  request: Request,
  context: StaffRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;
  const json = await request.json();
  const parsed = updateStaffSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "入力内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const existingStaff = await prisma.staff.findUnique({
    where: {
      id,
      storeId: store.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingStaff) {
    return NextResponse.json(
      {
        error: "施術者が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  const staff = await prisma.staff.update({
    where: {
      id,
      storeId: store.id,
    },
    data: parsed.data,
  });

  return NextResponse.json(staff);
}

export async function DELETE(
  _request: Request,
  context: StaffRouteContext
) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { id } = await context.params;

  const existingStaff = await prisma.staff.findUnique({
    where: {
      id,
      storeId: store.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingStaff) {
    return NextResponse.json(
      {
        error: "施術者が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  await prisma.staff.delete({
    where: {
      id,
      storeId: store.id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
