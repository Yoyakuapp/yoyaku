import { timingSafeEqual } from "node:crypto";

export function isValidOperatorPassword(candidate: string): boolean {
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
