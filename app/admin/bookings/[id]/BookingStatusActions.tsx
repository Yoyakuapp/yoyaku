"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

type BookingStatusActionsProps = {
  bookingId: string;
  currentStatus: BookingStatus;
  hasPayment: boolean;
};

export default function BookingStatusActions({
  bookingId,
  currentStatus,
  hasPayment,
}: BookingStatusActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function updateStatus(status: BookingStatus) {
    if (isSubmitting || currentStatus === status) {
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    });

    if (!response.ok) {
      setIsSubmitting(false);
      window.alert("予約状態の更新に失敗しました。");
      return;
    }

    router.refresh();
    setIsSubmitting(false);
  }

  async function cancelWithRefund() {
    if (isSubmitting || currentStatus === "CANCELLED") {
      return;
    }

    if (
      !window.confirm(
        "予約をキャンセルします。店舗のキャンセルポリシーに応じて予約金の返金処理を行います。よろしいですか？"
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    const response = await fetch(`/api/bookings/${bookingId}/refund`, {
      method: "POST",
    });

    const data = (await response.json().catch(() => null)) as {
      refundPercent?: number;
      refundAmount?: number;
      error?: string;
    } | null;

    if (!response.ok) {
      setIsSubmitting(false);
      window.alert(data?.error ?? "キャンセル処理に失敗しました。");
      return;
    }

    router.refresh();
    setIsSubmitting(false);
    window.alert(
      data?.refundAmount
        ? `予約をキャンセルしました。¥${data.refundAmount.toLocaleString()}（${data.refundPercent}%）を返金しました。`
        : "予約をキャンセルしました。キャンセルポリシーの対象期間外のため、返金は発生しませんでした。"
    );
  }

  return (
    <Card className="space-y-3">
      <h2 className="text-xl font-bold text-stone-900">
        予約状態を変更
      </h2>

      <Button
        onClick={() => updateStatus("CONFIRMED")}
        disabled={isSubmitting || currentStatus === "CONFIRMED"}
      >
        予約を確定する
      </Button>

      <Button
        variant="secondary"
        onClick={() => updateStatus("COMPLETED")}
        disabled={isSubmitting || currentStatus === "COMPLETED"}
      >
        施術完了にする
      </Button>

      <button
        type="button"
        onClick={() =>
          hasPayment ? cancelWithRefund() : updateStatus("CANCELLED")
        }
        disabled={isSubmitting || currentStatus === "CANCELLED"}
        className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {hasPayment
          ? "予約をキャンセルする(返金あり)"
          : "予約をキャンセルする"}
      </button>
    </Card>
  );
}
