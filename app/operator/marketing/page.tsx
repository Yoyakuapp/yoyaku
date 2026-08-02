"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import OperatorGate from "@/components/operator/OperatorGate";

export default function OperatorMarketingPage() {
  return (
    <MobileFrame>
      <OperatorGate>{() => <MarketingPanel />}</OperatorGate>
    </MobileFrame>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使えない環境では何もしない
    }
  }

  return (
    <Button variant="secondary" onClick={handleCopy} disabled={!text}>
      {copied ? "コピーしました" : label}
    </Button>
  );
}

function MarketingPanel() {
  const [applyUrl] = useState(() =>
    typeof window === "undefined" ? "" : `${window.location.origin}/apply`
  );
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const [bannerDataUrl, setBannerDataUrl] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);

  useEffect(() => {
    if (!applyUrl) {
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(applyUrl, {
      width: 480,
      margin: 2,
      color: { dark: "#1c3a2e", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
          setQrError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrError("QRコードの生成に失敗しました。");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyUrl]);

  async function generateBanner() {
    if (!qrDataUrl || isGeneratingBanner) {
      return;
    }

    setIsGeneratingBanner(true);
    setBannerError("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("canvas unsupported");
      }

      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, "#1c3a2e");
      gradient.addColorStop(1, "#2f6a4f");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px sans-serif";
      ctx.fillText("Yoyakus", 60, 100);

      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#d7e6dc";
      ctx.fillText("予約管理システム", 60, 135);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 52px sans-serif";
      wrapText(ctx, "導入店舗、募集中です。", 60, 260, 620, 60);

      ctx.font = "bold 26px sans-serif";
      ctx.fillStyle = "#d7e6dc";
      wrapText(
        ctx,
        "電話・WhatsApp・オンライン予約、店舗に合わせて選べます。",
        60,
        340,
        620,
        36
      );

      ctx.fillStyle = "#ffffff";
      roundRect(ctx, 860, 90, 280, 340, 24);
      ctx.fill();

      const qrImage = await loadImage(qrDataUrl);
      ctx.drawImage(qrImage, 890, 120, 220, 220);

      ctx.fillStyle = "#1c3a2e";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      wrapText(ctx, "こちらから登録", 1000, 370, 240, 26);
      ctx.textAlign = "left";

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(applyUrl.replace(/^https?:\/\//, ""), 60, 560);

      setBannerDataUrl(canvas.toDataURL("image/png"));
    } catch {
      setBannerError("バナー画像の作成に失敗しました。");
    } finally {
      setIsGeneratingBanner(false);
    }
  }

  const snsText = applyUrl
    ? `【お知らせ】\nマッサージ・リラクゼーション店舗向け予約管理システム「Yoyakus」、導入店舗を募集しています。\n電話・WhatsApp・オンライン予約から、お店に合った受付方法を選べます。\n詳しくはこちら → ${applyUrl}\n#Yoyakus #予約管理 #マッサージ #リラクゼーション`
    : "";

  const emailText = applyUrl
    ? `いつもお世話になっております。\n\n予約管理システム「Yoyakus」のご案内です。\n電話・WhatsApp・オンライン予約から、店舗に合った受付方法を選んでいただけます。\nオンライン予約を有効にした場合は、当日キャンセル防止のためのデポジット決済にも対応しています。\n\nご興味がございましたら、以下より利用申込をお願いいたします。\n${applyUrl}\n\n何かご不明な点がございましたら、お気軽にご連絡ください。`
    : "";

  const flyerText = applyUrl
    ? `Yoyakus 予約管理システム\n導入店舗、募集中です。\n\n電話・WhatsApp・オンライン予約、お店に合わせて選べます。\n\n今すぐ登録 → ${applyUrl}`
    : "";

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <p className="text-sm font-bold tracking-widest text-green-800">
          Yoyakus
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          宣伝用素材
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          店舗募集用のURL・QRコード・バナー画像や、SNS・メール・チラシ用の文章をまとめて用意できます。
        </p>
        <Link
          href="/operator"
          className="mt-3 inline-block text-sm font-bold text-green-800"
        >
          ← 運営者ページに戻る
        </Link>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">登録用URL</h2>
        <p className="break-all rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-800">
          {applyUrl || "読み込んでいます..."}
        </p>
        <CopyButton text={applyUrl} label="URLをコピー" />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">QRコード</h2>
        <p className="text-sm text-stone-500">
          チラシやSNS投稿に貼り付けてご利用いただけます。読み取ると利用申込ページが開きます。
        </p>

        {qrError ? (
          <p className="text-sm font-bold text-red-700">{qrError}</p>
        ) : qrDataUrl ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="利用申込ページのQRコード"
              className="h-48 w-48 rounded-xl border border-stone-200 bg-white p-2"
            />
            <a href={qrDataUrl} download="yoyakus-apply-qrcode.png" className="w-full">
              <Button variant="secondary">QRコードをダウンロード</Button>
            </a>
          </div>
        ) : (
          <p className="text-sm text-stone-500">作成しています...</p>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">バナー画像</h2>
        <p className="text-sm text-stone-500">
          SNS投稿やメール添付、印刷用に使えるバナー画像(1200×630)を作成します。
        </p>

        <Button
          onClick={generateBanner}
          disabled={!qrDataUrl || isGeneratingBanner}
        >
          {isGeneratingBanner ? "作成しています..." : "バナー画像を作成"}
        </Button>

        {bannerError ? (
          <p className="text-sm font-bold text-red-700">{bannerError}</p>
        ) : null}

        {bannerDataUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerDataUrl}
              alt="Yoyakus宣伝バナー"
              className="w-full rounded-xl border border-stone-200"
            />
            <a href={bannerDataUrl} download="yoyakus-banner.png" className="block">
              <Button variant="secondary">バナー画像をダウンロード</Button>
            </a>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">SNS投稿用の文章</h2>
        <pre className="whitespace-pre-wrap break-words rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          {snsText || "読み込んでいます..."}
        </pre>
        <CopyButton text={snsText} label="文章をコピー" />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">メール案内文</h2>
        <pre className="whitespace-pre-wrap break-words rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          {emailText || "読み込んでいます..."}
        </pre>
        <CopyButton text={emailText} label="文章をコピー" />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-stone-900">チラシ用の文章</h2>
        <pre className="whitespace-pre-wrap break-words rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          {flyerText || "読み込んでいます..."}
        </pre>
        <CopyButton text={flyerText} label="文章をコピー" />
      </Card>
    </div>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const characters = Array.from(text);
  let line = "";
  let currentY = y;

  for (const character of characters) {
    const testLine = line + character;

    if (line && ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, x, currentY);
      line = character;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, currentY);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image load failed"));
    image.src = src;
  });
}

