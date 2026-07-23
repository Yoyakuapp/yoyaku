import { NextResponse } from "next/server";
import { z } from "zod";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import {
  getPlatformSettings,
  setStoreNetworkEnabled,
  setTrialModeEnabled,
} from "@/lib/platformSettings";

function unauthorized() {
  return NextResponse.json(
    {
      error: "パスワードが正しくありません。",
    },
    {
      status: 401,
    }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return unauthorized();
  }

  const settings = await getPlatformSettings();

  return NextResponse.json({ settings });
}

const updateSchema = z.object({
  password: z.string().min(1),
  storeNetworkEnabled: z.boolean().optional(),
  trialModeEnabled: z.boolean().optional(),
});

export async function PUT(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "リクエスト内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const parsed = updateSchema.safeParse(json);

  if (!parsed.success || !isValidOperatorPassword(parsed.data.password)) {
    return unauthorized();
  }

  if (parsed.data.storeNetworkEnabled !== undefined) {
    const settings = await setStoreNetworkEnabled(parsed.data.storeNetworkEnabled);
    return NextResponse.json({ settings });
  }

  if (parsed.data.trialModeEnabled !== undefined) {
    const settings = await setTrialModeEnabled(parsed.data.trialModeEnabled);
    return NextResponse.json({ settings });
  }

  return NextResponse.json(
    {
      error: "更新する設定がありません。",
    },
    {
      status: 400,
    }
  );
}
