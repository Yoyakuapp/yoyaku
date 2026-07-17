import type { StoreLinkStatus, StoreLinkType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type StoreLinkClient = Pick<typeof prisma, "storeLink">;

const partnerSelect = {
  id: true,
  name: true,
  slug: true,
  city: true,
  country: true,
} as const;

type PartnerStore = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string;
};

type RawStoreLink = {
  id: string;
  type: StoreLinkType;
  status: StoreLinkStatus;
  requestingStoreId: string;
  targetStoreId: string;
  requestingStore: PartnerStore;
  targetStore: PartnerStore;
  createdAt: Date;
};

export function mapStoreLink(link: RawStoreLink, forStoreId: string) {
  return {
    id: link.id,
    type: link.type,
    status: link.status,
    isRequester: link.requestingStoreId === forStoreId,
    partner:
      link.requestingStoreId === forStoreId
        ? link.targetStore
        : link.requestingStore,
    createdAt: link.createdAt,
  };
}

export async function listStoreLinksForStore(
  storeId: string,
  db: StoreLinkClient = prisma
) {
  const links = await db.storeLink.findMany({
    where: {
      OR: [{ requestingStoreId: storeId }, { targetStoreId: storeId }],
    },
    include: {
      requestingStore: { select: partnerSelect },
      targetStore: { select: partnerSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  return links.map((link) => mapStoreLink(link, storeId));
}

export async function getStoreLinkWithPartners(
  id: string,
  db: StoreLinkClient = prisma
) {
  return db.storeLink.findUnique({
    where: { id },
    include: {
      requestingStore: { select: partnerSelect },
      targetStore: { select: partnerSelect },
    },
  });
}

export async function getAcceptedPartnerStoreIds(
  storeId: string,
  type: StoreLinkType,
  db: StoreLinkClient = prisma
): Promise<string[]> {
  const links = await db.storeLink.findMany({
    where: {
      type,
      status: "ACCEPTED" as StoreLinkStatus,
      OR: [{ requestingStoreId: storeId }, { targetStoreId: storeId }],
    },
    select: {
      requestingStoreId: true,
      targetStoreId: true,
    },
  });

  return links.map((link) =>
    link.requestingStoreId === storeId
      ? link.targetStoreId
      : link.requestingStoreId
  );
}
