export const requiredEnvironmentKeys = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;

export type RequiredEnvironmentKey =
  (typeof requiredEnvironmentKeys)[number];

export class MissingEnvironmentVariableError extends Error {
  constructor(readonly key: RequiredEnvironmentKey) {
    super(`Missing required environment variable: ${key}`);
    this.name = "MissingEnvironmentVariableError";
  }
}

export function getMissingEnvironmentKeys(
  keys: readonly RequiredEnvironmentKey[] = requiredEnvironmentKeys
) {
  return keys.filter((key) => !process.env[key]);
}

export function getRequiredEnvironmentValue(key: RequiredEnvironmentKey) {
  const value = process.env[key];

  if (!value) {
    throw new MissingEnvironmentVariableError(key);
  }

  return value;
}

export function isMissingEnvironmentVariableError(
  error: unknown
): error is MissingEnvironmentVariableError {
  return error instanceof MissingEnvironmentVariableError;
}
