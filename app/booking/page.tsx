"use client";

import Link from "next/link";
import { useState } from "react";

import MobileFrame from "@/components/layout/MobileFrame";
import StoreHeader from "@/components/booking/StoreHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type When = "今すぐ" | "今日" | "後日";

export default function BookingPage() {
  const [when, setWhen] = useState<When>("今すぐ");
  const [duration, setDuration] = useState(60);
  const [people, setPeople] = useState(1);

  const availabilityUrl = `/booking/availability?when=${encodeURIComponent(
    when
  )}&duration=${duration}&people=${people}`;

  return (
    <MobileFrame>
      <div className="space-y-4 pb-24">
        <StoreHeader />

        <div className="grid grid-cols-3 gap-2">
          {(["今すぐ", "今日", "後日"] as When[]).map((label) => (
            <Button
              key={label}
              variant={when === label ? "primary" : "secondary"}
              onClick={() => setWhen(label)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Card className="space-y-5">
          <h2 className="text-2xl font-bold text-stone-900">予約内容</h2>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-stone-800">
              何分受けますか？
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[30, 60, 90, 120].map((n) => (
                <Button
                  key={n}
                  variant={duration === n ? "primary" : "secondary"}
                  onClick={() => setDuration(n)}
                >
                  {n}分
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-200 pt-5">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-stone-800">
                何人で受けますか？
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <Button
                    key={n}
                    variant={people === n ? "primary" : "secondary"}
                    onClick={() => setPeople(n)}
                  >
                    {n}人
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2">
          <Link href={availabilityUrl}>
            <Button>空き時間を見る</Button>
          </Link>
        </div>

        <p className="pb-16 text-center text-sm text-stone-500">
          Powered by <span className="font-bold text-stone-800">Yoyaku</span>
        </p>
      </div>
    </MobileFrame>
  );
}