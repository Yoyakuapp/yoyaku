"use client";

import { useState } from "react";
import Button from "../ui/Button";

export default function PeopleSelector() {
  const [people, setPeople] = useState(1);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-stone-800">
        何人で受けますか？
      </h2>

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
  );
}