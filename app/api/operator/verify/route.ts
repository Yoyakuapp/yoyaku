import { NextResponse } from "next/server";

import { isValidOperatorPassword } from "@/lib/operatorAuth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";

  if (!isValidOperatorPassword(password)) {
    return NextResponse.json(
      {
        error: "パスワードが正しくありません。",
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({ ok: true });
}
