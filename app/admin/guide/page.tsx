import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Section = {
  title: string;
  body: string[];
};

const sections: Section[] = [
  {
    title: "はじめに",
    body: [
      "Yoyakusは、電話・WhatsApp・紙の予約帳だけで営業していたお店でも、今日から無理なく使える予約管理システムです。",
      "お客様は空き時間を見て「電話する」「WhatsAppで連絡する」「Yoyaku上でそのまま予約する」のいずれかを選べます。どの方法を使うかは、下記の「店舗情報」でお店ごとに自由に選べます。",
    ],
  },
  {
    title: "予約一覧",
    body: [
      "入っている予約の確認・詳細確認ができます。予約日時・お客様情報・メニュー・担当スタッフなどを確認できます。",
      "予約の詳細画面からは、予約日時の変更、ステータスの変更(確定・完了)、キャンセル(返金あり/なし)などが行えます。",
    ],
  },
  {
    title: "スケジュール管理",
    body: [
      "スタッフの出勤表・営業時間・休業日をまとめて管理する画面です。",
      "「出勤表」ではスタッフごとの1日の勤務時間を、「営業時間管理」では曜日ごとの営業時間を、「休業日管理」では臨時休業日を設定できます。ここで設定した内容が、お客様に見える「空き時間」に反映されます。",
    ],
  },
  {
    title: "施術者管理",
    body: [
      "スタッフの登録・編集・並び順を管理します。名前・説明・得意分野・性別(任意)・稼働状態(ON/OFF)を設定できます。",
      "稼働状態をOFFにすると、そのスタッフは予約画面に表示されなくなります(退職・長期休業などの際に使えます)。",
    ],
  },
  {
    title: "メニュー管理",
    body: [
      "施術メニュー・時間・料金・予約金の割合を設定します。",
      "先にカテゴリー(例: 全身マッサージ、フットマッサージなど)を登録し、そのカテゴリーの中に、時間の長さごとのメニュー(例: 60分・90分)を追加していく形式です。",
      "メニューごとに、予約金(デポジット)を「固定額」または「料金の◯%」で設定できます。ここで設定した金額が、実際にお客様がYoyaku予約時にカードで支払う金額になります。",
    ],
  },
  {
    title: "店舗情報",
    body: [
      "店舗名・住所・電話番号・写真・紹介文など、お店の基本情報を編集します。",
      "「予約の受け方」では、電話予約・WhatsApp予約・Yoyaku上での予約を、それぞれ個別にON/OFFできます。複数同時にONにでき、お客様は空き時間を見た時点で、有効な方法から選べます。",
      "「この店舗のページを一般公開する」をONにしないと、お客様は予約ページにアクセスできません。準備が整うまではOFFのままにしておけます。",
    ],
  },
  {
    title: "決済・予約金設定",
    body: [
      "Stripeでの入金先の登録と、予約金(デポジット)を受け取るかどうかを設定します。",
      "予約金を受け取らない(電話予約・WhatsApp予約だけ、またはYoyaku予約でも予約金なし)場合は、この画面の設定は不要です。",
      "予約金を受け取る場合は、①Stripe連携(入金先の銀行口座などの登録)を完了させたうえで、②「予約金を受け取る」を選択し、③キャンセルポリシー(何時間前のキャンセルで何%返金するか)を1段階以上設定する必要があります。",
      "Stripe連携が完了すると、お客様がカードで支払った予約金は、Yoyakusの口座を経由せず、Stripeを通じて直接お店の銀行口座に振り込まれます。Yoyakusが受け取るのは、あらかじめ決められたわずかな手数料分のみです。",
    ],
  },
  {
    title: "売上管理",
    body: ["予約金・売上の集計を確認できます。"],
  },
  {
    title: "顧客管理",
    body: ["これまでのお客様の一覧・来店履歴を確認できます。"],
  },
  {
    title: "店舗間連携",
    body: [
      "近隣店舗・系列店との間で、空き状況を連携する機能です。運営者側で連携が有効になっている場合にのみ利用できます。",
    ],
  },
  {
    title: "ログイン情報",
    body: [
      "管理画面のログインメールアドレス・パスワードを変更できます。パスワードを忘れた場合は、ログイン画面の「パスワードをお忘れの方」からリセットできます。",
    ],
  },
  {
    title: "管理画面の言語",
    body: [
      "画面上部の言語切り替えボタンから、管理画面の表示言語を変更できます。日本語・英語・中国語・韓国語・ドイツ語・オランダ語・フランス語・スペイン語・タイ語に対応しています。",
    ],
  },
];

export default function AdminGuidePage() {
  return (
    <AdminFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="block">
          <Button variant="secondary">店舗管理メインへ戻る</Button>
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>
          <h1 className="mt-2 text-3xl font-bold">システム利用ガイド</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            店舗情報の設定からメニュー登録、予約管理、キャンセル・返金対応まで、この管理画面の使い方をまとめたガイドです。困ったときは、いつでもこのページに戻って確認してください。
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

        <Link href="/admin" className="block">
          <Button variant="secondary">店舗管理メインへ戻る</Button>
        </Link>
      </div>
    </AdminFrame>
  );
}

