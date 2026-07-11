"use client";

import { useState } from "react";
import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type FAQ = {
  id: number;
  question: string;
  answer: string;
};

export default function AdminFaqPage() {
  const [faqs] = useState<FAQ[]>([
    {
      id: 1,
      question: "駐車場はありますか？",
      answer: "店舗前に2台ございます。",
    },
    {
      id: 2,
      question: "クレジットカードは使えますか？",
      answer: "Visa・Master・JCB・AMEXをご利用いただけます。",
    },
  ]);

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">

        <Link
          href="/admin"
          className="text-sm font-bold text-stone-500"
        >
          ← 管理画面
        </Link>

        <Card>

          <p className="text-sm font-bold text-green-800">
            Yoyaku Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            FAQ管理
          </h1>

        </Card>

        {faqs.map((faq) => (

          <Card
            key={faq.id}
            className="space-y-3"
          >

            <h2 className="font-bold text-lg">
              {faq.question}
            </h2>

            <p className="text-stone-600">
              {faq.answer}
            </p>

            <div className="grid grid-cols-2 gap-2">

              <Button variant="secondary">
                編集
              </Button>

              <Button variant="secondary">
                削除
              </Button>

            </div>

          </Card>

        ))}

        <Button>
          FAQを追加
        </Button>

      </div>
    </MobileFrame>
  );
}
