import { NextResponse } from "next/server";

import {
  getOperatorPasswordFromHeader,
  isValidOperatorPassword,
} from "@/lib/operatorAuth";

export async function GET(request: Request) {
  const password = getOperatorPasswordFromHeader(request);

  if (!(await isValidOperatorPassword(request, password))) {
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


