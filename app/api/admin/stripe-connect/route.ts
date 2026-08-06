import { NextResponse } from "next/server";
import Stripe from "stripe";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { createConnectedAccount, createOnboardingLink } from "@/lib/stripeConnect";
import { isMissingEnvironmentVariableError } from "@/lib/env";

function baseUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";
}

export async function GET() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  return NextResponse.json({
    connected: Boolean(store.stripeAccountId),
    chargesEnabled: store.stripeChargesEnabled,
    payoutsEnabled: store.stripePayoutsEnabled,
    detailsSubmitted: store.stripeDetailsSubmitted,
    onboardingCompletedAt: store.stripeOnboardingCompletedAt,
  });
}

export async function POST() {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  try {
    const accountId =
      store.stripeAccountId ??
      (
        await createConnectedAccount({
          id: store.id,
          name: store.name,
          email: store.email,
          country: store.country,
        })
      ).id;

    const accountLink = await createOnboardingLink(accountId, {
      refreshUrl: `${baseUrl()}/admin/payment`,
      returnUrl: `${baseUrl()}/api/admin/stripe-connect/refresh`,
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error("Failed to start Stripe Connect onboarding", error);

    if (isMissingEnvironmentVariableError(error)) {
      return NextResponse.json(
        {
          error: `Stripe連携の開始に失敗しました(サーバー設定エラー: ${error.key}が未設定です)。`,
        },
        {
          status: 500,
        }
      );
    }

    const detail =
      error instanceof Stripe.errors.StripeError ? error.message : undefined;

    return NextResponse.json(
      {
        error: detail
          ? `Stripe連携の開始に失敗しました: ${detail}`
          : "Stripe連携の開始に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }
}

