import type { Dictionary } from "./types";

const ja: Dictionary = {
  languagePicker: {
    title: "あなたがお使いの言語は？",
    description: "表示する言語を選んでください。",
    buttonLabel: "言語を選択",
  },
  bookingMenu: {
    when: {
      now: "今すぐ",
      today: "今日",
      later: "後日",
    },
    storeOwnerLink: "お店の方はこちら",
    bookingDetails: "予約内容",
    bookingDate: "予約日",
    menuHeading: "メニューはどれにしますか？",
    durationHeading: "時間は何分間ですか？",
    peopleHeading: "何人で受けますか？",
    peopleCount: (count) => `${count}人`,
    menuError: "メニューを取得できませんでした。",
    availabilityCta: "空き時間を見る",
    uncategorizedLabel: "その他",
  },
};

export default ja;
