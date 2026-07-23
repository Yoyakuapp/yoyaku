import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

type SettingsClient = Pick<typeof prisma, "platformSetting">;

export async function getPlatformSettings(db: SettingsClient = prisma) {
  const settings = await db.platformSetting.findUnique({
    where: { id: SETTINGS_ID },
  });

  return {
    storeNetworkEnabled: settings?.storeNetworkEnabled ?? false,
    trialModeEnabled: settings?.trialModeEnabled ?? true,
  };
}

export async function setStoreNetworkEnabled(
  enabled: boolean,
  db: SettingsClient = prisma
) {
  const settings = await db.platformSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, storeNetworkEnabled: enabled },
    update: { storeNetworkEnabled: enabled },
  });

  return {
    storeNetworkEnabled: settings.storeNetworkEnabled,
    trialModeEnabled: settings.trialModeEnabled,
  };
}

export async function setTrialModeEnabled(
  enabled: boolean,
  db: SettingsClient = prisma
) {
  const settings = await db.platformSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, trialModeEnabled: enabled },
    update: { trialModeEnabled: enabled },
  });

  return {
    storeNetworkEnabled: settings.storeNetworkEnabled,
    trialModeEnabled: settings.trialModeEnabled,
  };
}
