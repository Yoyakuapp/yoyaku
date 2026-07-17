import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { getPlatformSettings } from "@/lib/platformSettings";
import { prisma } from "@/lib/prisma";
import { listStoreLinksForStore, mapStoreLink } from "@/lib/storeLinks";

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const [links, settings] = await Promise.all([
    listStoreLinksForStore(store.id),
    getPlatformSettings(),
  ]);

  return NextResponse.json({
    links,
    storeNetworkEnabled: settings.storeNetworkEnabled,
  });
}

const createSchema = z.object({
  targetSlug: z.string().trim().min(1),
  type: z.enum(["SISTER", "REGIONAL"]),
});

export async function POST(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const settings = await getPlatformSettings();

  if (!settings.storeNetworkEnabled) {
    return NextResponse.json(
      {
        error: "店舗間連携機能は現在ご利用いただけません。",
      },
      {
        status: 403,
      }
    );
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "リクエスト内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const parsed = createSchema.safeParse(json);

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

  const { targetSlug, type } = parsed.data;

  const target = await prisma.store.findFirst({
    where: {
      slug: targetSlug,
      isActive: true,
      isPublished: true,
    },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json(
      {
        error: "対象の店舗が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  if (target.id === store.id) {
    return NextResponse.json(
      {
        error: "自分の店舗は選択できません。",
      },
      {
        status: 400,
      }
    );
  }

  const existingForward = await prisma.storeLink.findUnique({
    where: {
      requestingStoreId_targetStoreId_type: {
        requestingStoreId: store.id,
        targetStoreId: target.id,
        type,
      },
    },
    include: {
      requestingStore: {
        select: { id: true, name: true, slug: true, city: true, country: true },
      },
      targetStore: {
        select: { id: true, name: true, slug: true, city: true, country: true },
      },
    },
  });

  if (existingForward) {
    return NextResponse.json({ link: mapStoreLink(existingForward, store.id) });
  }

  const existingReverse = await prisma.storeLink.findUnique({
    where: {
      requestingStoreId_targetStoreId_type: {
        requestingStoreId: target.id,
        targetStoreId: store.id,
        type,
      },
    },
  });

  if (existingReverse && existingReverse.status !== "DECLINED") {
    const updated = await prisma.storeLink.update({
      where: { id: existingReverse.id },
      data: { status: "ACCEPTED" },
      include: {
        requestingStore: {
          select: { id: true, name: true, slug: true, city: true, country: true },
        },
        targetStore: {
          select: { id: true, name: true, slug: true, city: true, country: true },
        },
      },
    });

    return NextResponse.json({ link: mapStoreLink(updated, store.id) });
  }

  if (existingReverse) {
    await prisma.storeLink.delete({ where: { id: existingReverse.id } });
  }

  const created = await prisma.storeLink.create({
    data: {
      type,
      status: "PENDING",
      requestingStoreId: store.id,
      targetStoreId: target.id,
    },
    include: {
      requestingStore: {
        select: { id: true, name: true, slug: true, city: true, country: true },
      },
      targetStore: {
        select: { id: true, name: true, slug: true, city: true, country: true },
      },
    },
  });

  return NextResponse.json({ link: mapStoreLink(created, store.id) });
}
