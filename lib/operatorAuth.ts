import { timingSafeEqual } from "node:crypto";

import { getClientIp } from "@/lib/clientIp";
import {
  clearLoginAttempts,
  isLockedOut,
  recordFailedLoginAttempt,
} from "@/lib/loginAttempts";

function comparePassword(candidate: string): boolean {
  const expected = process.env.OPERATOR_INVITE_PASSWORD;

  if (!expected) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const candidateBuffer = Buffer.from(candidate);

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}

export async function isValidOperatorPassword(
  request: Request,
  candidate: string
): Promise<boolean> {
  const ipAddress = getClientIp(request);

  if (ipAddress && (await isLockedOut("OPERATOR", ipAddress))) {
    return false;
  }

  if (!comparePassword(candidate)) {
    if (ipAddress) {
      await recordFailedLoginAttempt("OPERATOR", ipAddress);
    }

    return false;
  }

  if (ipAddress) {
    await clearLoginAttempts("OPERATOR", ipAddress);
  }

  return true;
}

