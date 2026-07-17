"use client";

import { useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminNotificationsPage() {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [lineEnabled, setLineEnabled] = useState(false);
  const [customerMessage, setCustomerMessage] = useState(
    "ご予約ありがとうございます。予約内容をご確認ください。"
  );
  const [storeMessage, setStoreMessage] = useState(
    "新しい予約が入りました。管理画面で内容をご確認ください。"
  );

  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            通知設定
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            予約時の通知方法とメッセージを設定します。
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3">
            <div>
              <p className="font-bold text-stone-900">メール通知</p>
              <p className="text-sm text-stone-500">
                お客様と店舗へ予約通知を送信します。
              </p>
            </div>

            <button
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={
                emailEnabled
                  ? "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
              }
            >
              {emailEnabled ? "ON" : "OFF"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-3">
            <div>
              <p className="font-bold text-stone-900">LINE通知</p>
              <p className="text-sm text-stone-500">
                LINE連携後に利用できます。
              </p>
            </div>

            <button
              onClick={() => setLineEnabled(!lineEnabled)}
              className={
                lineEnabled
                  ? "rounded-full bg-green-800 px-4 py-2 text-sm font-bold text-white"
                  : "rounded-full bg-stone-300 px-4 py-2 text-sm font-bold text-stone-700"
              }
            >
              {lineEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <label className="text-sm font-bold text-stone-700">
              お客様向けメッセージ
            </label>

            <textarea
              value={customerMessage}
              onChange={(event) => setCustomerMessage(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-stone-700">
              店舗向けメッセージ
            </label>

            <textarea
              value={storeMessage}
              onChange={(event) => setStoreMessage(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-stone-900"
            />
          </div>

          <Button>保存する</Button>
        </Card>
      </div>
    </AdminFrame>
  );
}