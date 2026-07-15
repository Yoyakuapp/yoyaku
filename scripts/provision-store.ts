import { readFileSync } from "node:fs";

import {
  StoreProvisioningError,
  createStoreWithOwner,
} from "@/lib/storeProvisioning";
import { prisma } from "@/lib/prisma";

function getRequiredInputValue(value: string | undefined, label: string) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new StoreProvisioningError(`${label} is required.`, "INVALID_INPUT");
  }

  return normalizedValue;
}

function parseBooleanFlag(value: string | undefined) {
  return value?.trim().toLowerCase() === "y";
}

function readProvisioningInput() {
  const [
    organizationName,
    storeName,
    slug,
    ownerEmail,
    ownerName,
    ownerPassword,
    allowPhoneBooking,
    allowWhatsappBooking,
    allowYoyakuBooking,
    whatsappNumber,
  ] = readFileSync(0, "utf8").split("\n");

  return {
    organizationName: getRequiredInputValue(organizationName, "Organization name"),
    storeName: getRequiredInputValue(storeName, "Store name"),
    slug: getRequiredInputValue(slug, "Slug"),
    ownerEmail: getRequiredInputValue(ownerEmail, "Owner email"),
    ownerName: getRequiredInputValue(ownerName, "Owner name"),
    ownerPassword: getRequiredInputValue(ownerPassword, "Owner password"),
    allowPhoneBooking: parseBooleanFlag(allowPhoneBooking),
    allowWhatsappBooking: parseBooleanFlag(allowWhatsappBooking),
    allowYoyakuBooking: parseBooleanFlag(allowYoyakuBooking),
    whatsappNumber: whatsappNumber?.trim() ? whatsappNumber.trim() : null,
  };
}

async function main() {
  const result = await createStoreWithOwner(readProvisioningInput());

  console.info(`Organization: ${result.organizationId}`);
  console.info(`Store: ${result.storeId}`);
  console.info(`Slug: ${result.slug}`);
  console.info(`Admin Email: ${result.email}`);
}

main()
  .catch((error: unknown) => {
    if (error instanceof StoreProvisioningError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }

    console.error(
      error instanceof Error ? error.message : "Store provisioning failed."
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
