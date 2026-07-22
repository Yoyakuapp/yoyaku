import { NextResponse } from "next/server";

import { getStoreAdminLocaleBySlug, isStoreResolutionError } from "@/lib/currentStore";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;

  try {
    const adminLocale = await getStoreAdminLocaleBySlug(slug);

    return NextResponse.json({
      adminLocale,
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
