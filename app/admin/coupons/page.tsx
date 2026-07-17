"use client";

import { useState } from "react";
import Link from "next/link";

import AdminFrame from "@/components/layout/AdminFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Coupon = {
  id: number;
  name: string;
  code: string;
  discount: number;
  active: boolean;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 1,
      name: "初回限定",
      code: "WELCOME",
      discount: 1000,
      active: true,
    },
  ]);

  function toggle(id: number) {
    setCoupons(
      coupons.map((c) =>
        c.id === id
          ? {
              ...c,
              active: !c.active,
            }
          : c
      )
    );
  }

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
            クーポン管理
          </h1>
        </Card>

        {coupons.map((coupon) => (
          <Card
            key={coupon.id}
            className="space-y-3"
          >
            <div className="flex justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {coupon.name}
                </h2>

                <p className="text-stone-500">
                  {coupon.code}
                </p>

                <p className="font-bold text-green-700">
                  ¥{coupon.discount.toLocaleString()} OFF
                </p>

              </div>

              <Button
                variant="secondary"
                onClick={() => toggle(coupon.id)}
              >
                {coupon.active ? "公開中" : "停止中"}
              </Button>

            </div>
          </Card>
        ))}

      </div>
    </AdminFrame>
  );
}