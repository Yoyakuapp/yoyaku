import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createStaffSchema = z.object({
  name: z.string().trim().min(1),
  label: z.string().trim().default(""),
  skills: z.array(z.string().trim().min(1)).default([]),
  active: z.boolean().default(true),
});

export async function GET() {
  const staff = await prisma.staff.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(staff);
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createStaffSchema.safeParse(json);

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

  const staff = await prisma.staff.create({
    data: parsed.data,
  });

  return NextResponse.json(staff, {
    status: 201,
  });
}