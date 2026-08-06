import { NextResponse } from "next/server";

import { getDefaultStore, isStoreResolutionError } from "@/lib/currentStore";

export async function GET() {
  try {
    const store = await getDefaultStore();

    return NextResponse.json({
      name: store.name,
      phone: store.phone,
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

