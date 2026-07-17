import { NextResponse } from "next/server";
import { z } from "zod";

import {
  StoreProvisioningError,
  createStoreWithOwner,
} from "@/lib/storeProvisioning";

const signupSchema = z.object({
  token: z.string().trim().min(1),
  storeName: z.string().trim().min(1),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      message: "半角小文字・数字・ハイフンのみ使用できます。",
    }),
  ownerName: z.string().trim().min(1),
  ownerEmail: z.string().trim().toLowerCase().email(),
  ownerPassword: z.string().min(12),
});

function jsonError(message: string, status: 400 | 409 | 500) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return jsonError("リクエスト内容が正しくありません。", 400);
  }

  const parsed = signupSchema.safeParse(json);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];

    return jsonError(
      firstIssue?.message ?? "入力内容を確認してください。",
      400
    );
  }

  try {
    const result = await createStoreWithOwner({
      organizationName: parsed.data.storeName,
      storeName: parsed.data.storeName,
      slug: parsed.data.slug,
      ownerName: parsed.data.ownerName,
      ownerEmail: parsed.data.ownerEmail,
      ownerPassword: parsed.data.ownerPassword,
      inviteToken: parsed.data.token,
      allowPhoneBooking: false,
      allowWhatsappBooking: false,
      allowYoyakuBooking: true,
      whatsappNumber: null,
    });

    return NextResponse.json({
      slug: result.slug,
    });
  } catch (error) {
    if (error instanceof StoreProvisioningError) {
      const status = error.code === "INVALID_INPUT" ? 400 : 409;
      return jsonError(error.message, status);
    }

    return jsonError("登録に失敗しました。", 500);
  }
}
