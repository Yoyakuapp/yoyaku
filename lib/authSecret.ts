export const authSecret =
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "production"
    ? undefined
    : "yoyaku-development-nextauth-secret");
