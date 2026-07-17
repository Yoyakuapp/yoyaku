import { NextResponse } from "next/server";

import { isValidOperatorPassword } from "@/lib/operatorAuth";
import { prisma } from "@/lib/prisma";

type StoreRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function DELETE(request: Request, context: StoreRouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") ?? "";
  const force = searchParams.get("force") === "true";

  if (!isValidOperatorPassword(password)) {
    return unauthorized();
  }

  const store = await prisma.store.findUnique({
    where: { id },
    select: { id: true, organizationId: true },
  });

  if (!store) {
    return NextResponse.json(
      {
        error: "店舗が見つかりません。",
      },
      {
        status: 404,
      }
    );
  }

  const [bookingCount, paymentAttemptCount] = await Promise.all([
    prisma.booking.count({ where: { storeId: id } }),
    prisma.bookingPaymentAttempt.count({ where: { storeId: id } }),
  ]);

  if (!force && (bookingCount > 0 || paymentAttemptCount > 0)) {
    return NextResponse.json(
      {
        error:
          "この店舗には予約または決済の履歴があるため削除できません。表示を止めたい場合は、店舗の管理画面から非公開に設定してください。",
        bookingCount,
        paymentAttemptCount,
      },
      {
        status: 409,
      }
    );
  }

  await prisma.$transaction(async (tx) => {
    if (force) {
      await tx.bookingPaymentAttempt.deleteMany({ where: { storeId: id } });
      await tx.booking.deleteMany({ where: { storeId: id } });
    }

    await tx.staff.deleteMany({ where: { storeId: id } });
    await tx.businessHour.deleteMany({ where: { storeId: id } });
    await tx.businessHourOverride.deleteMany({ where: { storeId: id } });
    await tx.holiday.deleteMany({ where: { storeId: id } });
    await tx.store.delete({ where: { id } });

    const remainingStores = await tx.store.count({
      where: { organizationId: store.organizationId },
    });

    if (remainingStores === 0) {
      await tx.organization.delete({ where: { id: store.organizationId } });
    }
  });

  return NextResponse.json({ success: true });
}
