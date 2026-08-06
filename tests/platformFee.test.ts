import assert from "node:assert/strict";
import test from "node:test";

import { calculatePlatformFee, getPlatformFeeBps } from "../lib/platformFee";

function withEnv(value: string | undefined, run: () => void) {
  const original = process.env.PLATFORM_FEE_BPS;

  if (value === undefined) {
    delete process.env.PLATFORM_FEE_BPS;
  } else {
    process.env.PLATFORM_FEE_BPS = value;
  }

  try {
    run();
  } finally {
    if (original === undefined) {
      delete process.env.PLATFORM_FEE_BPS;
    } else {
      process.env.PLATFORM_FEE_BPS = original;
    }
  }
}

test("getPlatformFeeBps defaults to 500 when the env var is unset", () => {
  withEnv(undefined, () => {
    assert.equal(getPlatformFeeBps(), 500);
  });
});

test("getPlatformFeeBps defaults when the env var is out of range or invalid", () => {
  withEnv("-1", () => {
    assert.equal(getPlatformFeeBps(), 500);
  });

  withEnv("10001", () => {
    assert.equal(getPlatformFeeBps(), 500);
  });

  withEnv("not-a-number", () => {
    assert.equal(getPlatformFeeBps(), 500);
  });
});

test("getPlatformFeeBps accepts a configured value within range", () => {
  withEnv("300", () => {
    assert.equal(getPlatformFeeBps(), 300);
  });

  withEnv("0", () => {
    assert.equal(getPlatformFeeBps(), 0);
  });

  withEnv("10000", () => {
    assert.equal(getPlatformFeeBps(), 10000);
  });
});

test("calculatePlatformFee applies the configured bps to the deposit and rounds", () => {
  withEnv("500", () => {
    assert.equal(calculatePlatformFee(1000), 50);
    assert.equal(calculatePlatformFee(1350), 68);
    assert.equal(calculatePlatformFee(0), 0);
  });
});

test("calculatePlatformFee takes the full deposit at 10000 bps", () => {
  withEnv("10000", () => {
    assert.equal(calculatePlatformFee(2500), 2500);
  });
});

