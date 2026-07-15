import { stdin as input, stdout as output } from "node:process";

import {
  AdminProvisioningError,
  upsertStoreManagerAdminUser,
} from "@/lib/adminProvisioning";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || "admin@yoyakus.com";
const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || "Masa Ogawa";

async function readHiddenInput(prompt: string) {
  const stdin = process.stdin;
  const wasRaw = stdin.isRaw;

  output.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  let value = "";

  return new Promise<string>((resolve) => {
    function cleanup() {
      stdin.off("data", onData);
      stdin.setRawMode(wasRaw);
    }

    function onData(chunk: Buffer | string) {
      const text = String(chunk);

      for (const char of text) {
        if (char === "\r" || char === "\n") {
          output.write("\n");
          cleanup();
          resolve(value);
          return;
        }

        if (char === "\u0003") {
          output.write("\n");
          cleanup();
          process.exit(130);
        }

        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
          continue;
        }

        value += char;
      }
    }

    stdin.on("data", onData);
  });
}

async function readPassword() {
  const envPassword = process.env.ADMIN_PASSWORD;

  if (envPassword !== undefined) {
    return envPassword;
  }

  if (!input.isTTY || !output.isTTY) {
    throw new Error("Admin provisioning requires an interactive terminal.");
  }

  const password = await readHiddenInput("Password: ");
  const confirmPassword = await readHiddenInput("Confirm Password: ");

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  return password;
}

async function main() {
  const password = await readPassword();
  const result = await upsertStoreManagerAdminUser({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    password,
  });

  console.info(`Email: ${result.email}`);
  console.info(`Store: ${result.storeId}`);
  console.info(`Role: ${result.role}`);
  console.info(`Action: ${result.action}`);
}

main()
  .catch((error: unknown) => {
    if (error instanceof AdminProvisioningError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }

    console.error(
      error instanceof Error ? error.message : "Admin provisioning failed."
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
