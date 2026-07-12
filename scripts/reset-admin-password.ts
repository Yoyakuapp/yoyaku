import bcrypt from "bcrypt";
import { stdin as input, stdout as output } from "node:process";

import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "admin@yoyakus.test";
const BCRYPT_ROUNDS = 12;

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

async function main() {
  const envPassword = process.env.ADMIN_PASSWORD;

  if (envPassword !== undefined) {
    if (envPassword.length < 12) {
      throw new Error("Password must be at least 12 characters.");
    }

    await resetPassword(envPassword);
    return;
  }

  if (!input.isTTY || !output.isTTY) {
    throw new Error("Password reset requires an interactive terminal.");
  }

  const password = await readHiddenInput("Password: ");
  const confirmPassword = await readHiddenInput("Confirm Password: ");

  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  await resetPassword(password);
}

async function resetPassword(password: string) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const adminUser = await prisma.adminUser.update({
    where: {
      email: ADMIN_EMAIL,
    },
    data: {
      passwordHash,
    },
    select: {
      email: true,
    },
  });

  console.info(`Email: ${adminUser.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Password reset failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
