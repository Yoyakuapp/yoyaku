"use client";

import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import OperatorGate from "@/components/operator/OperatorGate";

type Section = {
  title: string;
  body: string[];
};

const sections: Section[] = [
  {
    title: "運営者ページの役割",
    body: [
      "運営者ページは、Yoyakusプラットフォーム全体を管理するための画面です。個々の店舗の管理画面(店舗管理メイン)とは別で、パスワードで保護されています。",
    ],
  },
  {
    title: "招待リンク管理",
    body: [
      "新しい店舗を招待するリンクを発行できます。発行したリンクを店舗のご担当者に送ると、そのリンクから店舗登録(店舗名・ログイン情報の入力)ができます。",
      "「発行済み招待リンク管理」から、これまでに発行したリンクの一覧・使用状況(未使用/使用済み)を確認できます。",
    ],
  },
  {
    title: "店舗一覧・お申し込み管理",
    body: [
      "登録済みの店舗の一覧を確認・管理できます。各店舗の管理画面にワンクリックで入る、ログイン情報をリセットする、といった操作ができます。",
      "「/apply」から届いた利用申込は、運営者ページの申込一覧から確認し、招待リンクの発行につなげられます。",
    ],
  },
  {
    title: "店舗間連携のマスタースイッチ",
    body: [
      "近隣店舗・系列店どうしの空き状況連携機能を、プラットフォーム全体としてON/OFFする設定です。OFFの間は、各店舗の管理画面にも店舗間連携の機能は表示されません。",
    ],
  },
  {
    title: "試用期間の切り替え",
    body: [
      "「試用期間中」⇄「運用開始済み」の表示切り替えです。これはシステムの動作には影響しない、運営者自身のための記録・目印です。実際に本番でお金を受け取れるようにするには、別途Stripeの本番切り替えが必要です(下記参照)。",
    ],
  },
  {
    title: "管理者アカウント管理",
    body: [
      "運営者ページにログインできる管理者アカウントを追加・管理できます。複数人で運営する場合に使います。",
    ],
  },
  {
    title: "開発・運用情報",
    body: [
      "Neon(データベース)・Vercel(ホスティング)・Stripe(決済)など、Yoyakusを支えている外部サービスの管理画面へのリンクと、それぞれの費用の目安をまとめています。運営者ページ下部の「開発・運用情報」セクションから確認できます。",
    ],
  },
  {
    title: "宣伝用素材ページ",
    body: [
      "新規の店舗を勧誘する際に使えるQRコードやチラシ素材などをまとめたページです。",
    ],
  },
  {
    title: "Stripeを本番モードに切り替える手順(概要)",
    body: [
      "実際にお客様からお金を受け取れるようにするには、次の3ステップが必要です。",
      "① Stripeダッシュボード(dashboard.stripe.com)で、Yoyakusプラットフォーム自身の事業者確認(本人確認)を完了させ、本番用のAPIキーを取得する。",
      "② 取得した本番用のAPIキーを、Vercelの環境変数(STRIPE_SECRET_KEY・NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY・STRIPE_WEBHOOK_SECRET)に設定し直す。これは実際のお金が動くようになる、後戻りしにくい大事な切り替えです。",
      "③ 各店舗が、本番モードであらためてStripe連携(入金先の銀行口座登録など)をやり直す。テストモードで連携した店舗の情報は、本番モードでは引き継がれません。",
      "この切り替えは慎重に進める必要があるため、実施する際は開発担当と一緒に、1つずつ確認しながら行うことをおすすめします。",
    ],
  },
];

function GuidePanel() {
  return (
    <div className="space-y-4 pb-8">
      <Link href="/operator" className="block">
        <Button variant="secondary">運営者ページへ戻る</Button>
      </Link>

      <Card>
        <p className="text-sm font-bold text-green-800">Yoyakus</p>
        <h1 className="mt-2 text-3xl font-bold">システム利用ガイド</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          招待リンクの発行、店舗一覧の管理、プラットフォーム全体の設定など、運営者としての操作手順をまとめたガイドです。
        </p>
      </Card>

      {sections.map((section) => (
        <Card key={section.title} className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            {section.title}
          </h2>
          {section.body.map((paragraph, index) => (
            <p key={index} className="text-sm leading-6 text-stone-600">
              {paragraph}
            </p>
          ))}
        </Card>
      ))}

      <Link href="/operator" className="block">
        <Button variant="secondary">運営者ページへ戻る</Button>
      </Link>
    </div>
  );
}

export default function OperatorGuidePage() {
  return (
    <MobileFrame>
      <OperatorGate>{() => <GuidePanel />}</OperatorGate>
    </MobileFrame>
  );
}

