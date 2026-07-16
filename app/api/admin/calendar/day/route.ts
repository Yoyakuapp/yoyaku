import { NextResponse } from "next/server";

import { requireAdminApiStore } from "@/lib/adminApiAuth";
import {
  CalendarDayError,
  saveCalendarDay,
  saveCalendarDaySchema,
} from "@/lib/adminCalendar";

export async function PUT(request: Request) {
  const { response, store } = await requireAdminApiStore();

  if (response) {
    return response;
  }

  const json = await request.json();
  const parsed = saveCalendarDaySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "入力内容が正しくありません。",
      },
      {
        status: 400,
      }
    );
  }

  try {
    await saveCalendarDay(store.id, parsed.data);
  } catch (error) {
    if (error instanceof CalendarDayError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error: "保存に失敗しました。",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    success: true,
  });
}
