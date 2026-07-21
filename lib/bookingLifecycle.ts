import type { BookingStatus } from "@prisma/client";

const VALID_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
};

export class BookingLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingLifecycleError";
  }
}

export function assertValidBookingTransition(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus
) {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!VALID_BOOKING_TRANSITIONS[currentStatus].includes(nextStatus)) {
    throw new BookingLifecycleError("この予約状態には変更できません。");
  }
}

export function assertRefundableBooking(input: {
  status: BookingStatus;
  stripePaymentIntentId: string | null;
  refundedAt: Date | null;
}) {
  if (input.status !== "CONFIRMED") {
    throw new BookingLifecycleError("確定済みの予約のみ返金できます。");
  }

  if (!input.stripePaymentIntentId) {
    throw new BookingLifecycleError("返金対象の決済がありません。");
  }

  if (input.refundedAt) {
    throw new BookingLifecycleError("この予約はすでに返金済みです。");
  }
}
