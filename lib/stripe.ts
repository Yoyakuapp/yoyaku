import Stripe from "stripe";

import { getRequiredEnvironmentValue } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe() {
  const secretKey = getRequiredEnvironmentValue("STRIPE_SECRET_KEY");

  stripe ??= new Stripe(secretKey);

  return stripe;
}

export function getStripeWebhookSecret() {
  return getRequiredEnvironmentValue("STRIPE_WEBHOOK_SECRET");
}
