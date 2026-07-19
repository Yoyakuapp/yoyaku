import { NextResponse } from "next/server";

import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;

  try {
    const store = await getPublicStoreBySlug(slug);

    return NextResponse.json({
      name: store.name,
      description: store.description,
      imageUrl: store.imageUrl,
      imageUrls: store.imageUrls,
      address: store.address,
      phone: store.phone,
      websiteUrl: store.websiteUrl,
      whatsappNumber: store.whatsappNumber,
      timezone: store.timezone,
      allowPhoneBooking: store.allowPhoneBooking,
      allowWhatsappBooking: store.allowWhatsappBooking,
      allowYoyakuBooking: store.allowYoyakuBooking,
      requiresDeposit: store.requiresDeposit,
      stripeAccountId: store.stripeAccountId,
      stripeChargesEnabled: store.stripeChargesEnabled,
    });
  } catch (error) {
    if (isStoreResolutionError(error)) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    return NextResponse.json(
      {
        error: "店舗情報を取得できませんでした。",
      },
      {
        status: 500,
      }
    );
  }
}
