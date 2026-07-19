import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function createConnectedAccount(store: {
  id: string;
  name: string;
  email: string | null;
  country: string;
}) {
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: "standard",
    country: store.country || "JP",
    email: store.email ?? undefined,
    business_profile: {
      name: store.name,
    },
  });

  await prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      stripeAccountId: account.id,
    },
  });

  return account;
}

export async function createOnboardingLink(
  accountId: string,
  urls: { refreshUrl: string; returnUrl: string }
) {
  const stripe = getStripe();

  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: urls.refreshUrl,
    return_url: urls.returnUrl,
    type: "account_onboarding",
  });
}

export async function applyAccountStatusToStore(account: Stripe.Account) {
  const store = await prisma.store.findUnique({
    where: {
      stripeAccountId: account.id,
    },
    select: {
      id: true,
      stripeOnboardingCompletedAt: true,
    },
  });

  if (!store) {
    return null;
  }

  return prisma.store.update({
    where: {
      id: store.id,
    },
    data: {
      stripeChargesEnabled: Boolean(account.charges_enabled),
      stripePayoutsEnabled: Boolean(account.payouts_enabled),
      stripeDetailsSubmitted: Boolean(account.details_submitted),
      stripeOnboardingCompletedAt:
        account.details_submitted && !store.stripeOnboardingCompletedAt
          ? new Date()
          : store.stripeOnboardingCompletedAt,
    },
  });
}

export async function syncAccountStatus(accountId: string) {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  return applyAccountStatusToStore(account);
}
