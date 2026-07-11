import assert from "node:assert/strict";
import test from "node:test";

import {
  getMissingEnvironmentKeys,
  getRequiredEnvironmentValue,
  MissingEnvironmentVariableError,
} from "../lib/env";

test("environment helper reports missing keys without exposing values", () => {
  const key = "NEXTAUTH_SECRET";
  const originalValue = process.env[key];

  delete process.env[key];

  try {
    assert.deepEqual(getMissingEnvironmentKeys([key]), [key]);
    assert.throws(
      () => getRequiredEnvironmentValue(key),
      MissingEnvironmentVariableError
    );
  } finally {
    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalValue;
    }
  }
});

test("environment helper accepts configured keys", () => {
  const key = "NEXTAUTH_SECRET";
  const originalValue = process.env[key];

  process.env[key] = "configured-for-test";

  try {
    assert.deepEqual(getMissingEnvironmentKeys([key]), []);
    assert.equal(getRequiredEnvironmentValue(key), "configured-for-test");
  } finally {
    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalValue;
    }
  }
});
