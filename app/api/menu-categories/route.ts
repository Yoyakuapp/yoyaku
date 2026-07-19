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
