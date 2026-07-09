"use client";

import { useState } from "react";
import Button from "../ui/Button";

export default function DurationSelector() {
  const [duration, setDuration] = useState(60);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-stone-800">
        何分受けますか？
      </h2>

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
  );
}