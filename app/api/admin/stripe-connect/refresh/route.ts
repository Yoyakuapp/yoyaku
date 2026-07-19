import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { syncAccountStatus } from "@/lib/stripeConnect";

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";
}

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return NextResponse.redirect(`${baseUrl()}/login`);
  }

  if (store.stripeAccountId) {
    await syncAccountStatus(store.stripeAccountId).catch(() => null);
  }

  return NextResponse.redirect(`${baseUrl()}/admin/store`);
}
