import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import { getMonthCalendar, isValidMonthValue } from "@/lib/adminCalendar";

function formatMonthValue(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export async function GET(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? formatMonthValue(new Date());

  if (!isValidMonthValue(month)) {
    return NextResponse.json(
      {
        error: "月の指定が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  const calendar = await getMonthCalendar(store.id, month);

  return NextResponse.json(calendar);
}
