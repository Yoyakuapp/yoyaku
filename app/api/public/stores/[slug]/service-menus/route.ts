import { NextResponse } from "next/server";

import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import { getActiveServiceMenusForStore } from "@/lib/serviceMenus";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;

  try {
    const store = await getPublicStoreBySlug(slug);
    const menus = await getActiveServiceMenusForStore(store.id);

    return NextResponse.json(menus);
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
        error: "メニューを取得できませんでした。",
      },
      {
        status: 500,
      }
    );
  }
}
