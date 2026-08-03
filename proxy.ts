import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

import { authSecret } from "@/lib/authSecret";

const withAuthProxy = withAuth({
  pages: {
    signIn: "/login",
  },
  secret: authSecret,
});

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Yoyakus Admin"',
    },
  });
}

function hasValidBasicAuth(request: NextRequest): boolean {
  const username = process.env.ADMIN_BASIC_AUTH_USER;
  const password = process.env.ADMIN_BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return true;
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const encoded = authHeader.slice("Basic ".length);

  let decoded = "";

  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex === -1) {
    return false;
  }

  const providedUser = decoded.slice(0, separatorIndex);
  const providedPassword = decoded.slice(separatorIndex + 1);

  return (
    timingSafeEqualString(providedUser, username) &&
    timingSafeEqualString(providedPassword, password)
  );
}

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!hasValidBasicAuth(request)) {
    return unauthorizedResponse();
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return withAuthProxy(request as never, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/operator/:path*",
    "/api/operator/:path*",
    "/login",
  ],
};

