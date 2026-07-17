import { readFileSync } from "node:fs";

import { createStoreInvite } from "@/lib/storeInvites";
import { prisma } from "@/lib/prisma";

async function main() {
  const [label] = readFileSync(0, "utf8").split("\n");
  const invite = await createStoreInvite(label);

  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.yoyakus.com";

  console.info(`招待リンク: ${baseUrl}/signup/${invite.token}`);
}

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "招待リンクの作成に失敗しました。"
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
