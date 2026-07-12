import { readFileSync } from "node:fs";

import {
  AdminProvisioningError,
  createInitialAdminUser,
} from "@/lib/adminProvisioning";
import { prisma } from "@/lib/prisma";

function getRequiredInputValue(value: string | undefined, label: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new AdminProvisioningError(
      `${label} is required.`,
      "INVALID_INPUT"
    );
  }

  return normalizedValue;
}

function readProvisioningInput() {
  const [email, name, password] = readFileSync(0, "utf8").split("\n");

  return {
    email: getRequiredInputValue(email, "Email"),
    name: getRequiredInputValue(name, "Name"),
    password: getRequiredInputValue(password, "Password"),
  };
}

async function main() {
  const result = await createInitialAdminUser(readProvisioningInput());

  console.info(`Email: ${result.email}`);
  console.info(`Store: ${result.storeId}`);
  console.info(`Role: ${result.role}`);
}

main()
  .catch((error: unknown) => {
    if (error instanceof AdminProvisioningError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }

    console.error("Initial admin provisioning failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
