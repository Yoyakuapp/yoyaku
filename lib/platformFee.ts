const DEFAULT_PLATFORM_FEE_BPS = 500;

export function getPlatformFeeBps() {
  const raw = process.env.PLATFORM_FEE_BPS;
  const parsed = raw ? Number(raw) : NaN;

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10000) {
    return DEFAULT_PLATFORM_FEE_BPS;
  }

  return parsed;
}

export function calculatePlatformFee(depositAmount: number) {
  return Math.round((depositAmount * getPlatformFeeBps()) / 10000);
}
