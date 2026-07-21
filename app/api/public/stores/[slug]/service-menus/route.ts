import { NextResponse } from "next/server";

import { getPublicStoreBySlug, isStoreResolutionError } from "@/lib/currentStore";
import { getActiveServiceMenusForStore } from "@/lib/serviceMenus";
import { isSupportedLocale } from "@/lib/i18n/locales";

type StoreRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: StoreRouteContext) {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale");

  try {
    const store = await getPublicStoreBySlug(slug);
    const menus = await getActiveServiceMenusForStore(store.id, undefined, {
      locale:
        localeParam && isSupportedLocale(localeParam) ? localeParam : undefined,
      adminLocale: store.adminLocale,
    });

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
