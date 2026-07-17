"use client";

import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const reviews = [
  {
    id: 1,
    name: "山田 太郎",
    rating: 5,
    date: "2026-07-09",
    review: "とても丁寧で最高でした。",
  },
  {
    id: 2,
    name: "佐藤 花子",
    rating: 4,
    date: "2026-07-08",
    review: "また利用したいです。",
  },
];

export default function ReviewsPage() {
  return (
    <AdminFrame>
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
            レビュー管理
          </h1>

        </Card>

        {reviews.map((review) => (

          <Card
            key={review.id}
            className="space-y-3"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="font-bold">
                  {review.name}
                </h2>

                <p className="text-sm text-stone-500">
                  {review.date}
                </p>

              </div>

              <p className="font-bold text-yellow-500">
                {"★".repeat(review.rating)}
              </p>

            </div>

            <p>
              {review.review}
            </p>

            <Button variant="secondary">
              返信する
            </Button>

          </Card>

        ))}

      </div>
    </AdminFrame>
  );
}