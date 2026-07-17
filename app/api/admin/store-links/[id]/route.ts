import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { prisma } from "@/lib/prisma";
import { getStoreLinkWithPartners, mapStoreLink } from "@/lib/storeLinks";

type LinkRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const patchSchema = z.object({
  action: z.literal("accept"),
});

export async function PATCH(request: Request, context: LinkRouteContext) {
  const { id } = await context.params;
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
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

  const parsed = patchSchema.safeParse(json);

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

  const link = await getStoreLinkWithPartners(id);

  if (!link) {
    return NextResponse.json(
      {
        error: "連携リクエストが見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  if (link.targetStoreId !== store.id) {
    return NextResponse.json(
      {
        error: "この操作を行う権限がありません。",
      },
      {
        status: 403,
      }
    );
  }

  if (link.status !== "PENDING") {
    return NextResponse.json({ link: mapStoreLink(link, store.id) });
  }

  const updated = await prisma.storeLink.update({
    where: { id },
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

export async function DELETE(request: Request, context: LinkRouteContext) {
  const { id } = await context.params;
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const link = await getStoreLinkWithPartners(id);

  if (!link) {
    return NextResponse.json(
      {
        error: "連携リクエストが見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  if (link.requestingStoreId !== store.id && link.targetStoreId !== store.id) {
    return NextResponse.json(
      {
        error: "この操作を行う権限がありません。",
      },
      {
        status: 403,
      }
    );
  }

  await prisma.storeLink.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
