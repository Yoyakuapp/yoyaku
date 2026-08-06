"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import OperatorGate from "@/components/operator/OperatorGate";

type Application = {
  id: string;
  storeName: string;
  applicantName: string;
  email: string;
  phone: string | null;
  message: string | null;
  ipAddress: string | null;
  status: "ISSUED" | "REJECTED";
  createdAt: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OperatorApplicationsPage() {
  return (
    <MobileFrame>
      <OperatorGate>
        {(password) => <ApplicationsPanel password={password} />}
      </OperatorGate>
    </MobileFrame>
  );
}

function ApplicationsPanel({ password }: { password: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  async function loadApplications() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/operator/applications", {
        headers: {
          "X-Operator-Password": password,
        },
      });

      if (!response.ok) {
        setError("読み込みに失敗しました。");
        return;
      }

      const data = (await response.json()) as { applications: Application[] };
      setApplications(data.applications);
    } catch {
      setError("読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    void loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          利用申込一覧
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          公開申込フォーム(/apply)から届いたお申し込みの記録です。「受付」は招待リンクを自動発行しメールで送信済み、「拒否」は認証(bot対策)や制限により自動的に受け付けなかった申込です。
        </p>
        <Link
          href="/operator/invites/manage"
          className="mt-3 inline-block text-sm font-bold text-green-800"
        >
          発行済み招待リンク管理を見る →
        </Link>
      </Card>

      <Card>
        {error ? (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-stone-500">読み込んでいます...</p>
        ) : applications.length === 0 ? (
          <p className="text-sm text-stone-500">まだ申込がありません。</p>
        ) : (
          <ul className="space-y-3">
            {applications.map((application) => (
              <li
                key={application.id}
                className={`rounded-xl border px-4 py-3 ${
                  application.status === "ISSUED"
                    ? "border-green-200 bg-green-50"
                    : "border-stone-200"
                }`}
              >
                <p className="text-xs font-bold text-stone-500">
                  {application.status === "ISSUED" ? "受付" : "拒否"} ・{" "}
                  {formatDateTime(application.createdAt)}
                </p>
                <p className="mt-1 text-sm font-bold text-stone-800">
                  {application.storeName}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {application.applicantName} / {application.email}
                  {application.phone ? ` / ${application.phone}` : ""}
                </p>
                {application.message ? (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-stone-500">
                    {application.message}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Link href="/operator" className="block">
        <Button variant="secondary">← 運営者ページに戻る</Button>
      </Link>
    </div>
  );
}

