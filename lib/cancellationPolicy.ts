export type CancellationPolicyTier = {
  hoursBefore: number;
  refundPercent: number;
};

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicyTier[] = [
  { hoursBefore: 24, refundPercent: 100 },
];

export function parseCancellationPolicy(
  value: unknown
): CancellationPolicyTier[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const tiers: CancellationPolicyTier[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const hoursBefore = (item as Record<string, unknown>).hoursBefore;
    const refundPercent = (item as Record<string, unknown>).refundPercent;

    if (
      typeof hoursBefore === "number" &&
      Number.isFinite(hoursBefore) &&
      hoursBefore > 0 &&
      typeof refundPercent === "number" &&
      Number.isFinite(refundPercent) &&
      refundPercent >= 0 &&
      refundPercent <= 100
    ) {
      tiers.push({ hoursBefore, refundPercent });
    }
  }

  return tiers.length > 0 ? tiers : null;
}

export function calculateRefundPercent(
  policy: CancellationPolicyTier[] | null,
  bookingDate: Date,
  now: Date = new Date()
): number {
  const tiers =
    policy && policy.length > 0 ? policy : DEFAULT_CANCELLATION_POLICY;
  const sortedTiers = [...tiers].sort((a, b) => b.hoursBefore - a.hoursBefore);

  for (const tier of sortedTiers) {
    const deadline = new Date(bookingDate);
    deadline.setUTCHours(deadline.getUTCHours() - tier.hoursBefore);

    if (now <= deadline) {
      return tier.refundPercent;
    }
  }

  return 0;
}
