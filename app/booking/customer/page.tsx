import { Suspense } from "react";

import MobileFrame from "@/components/layout/MobileFrame";
import CustomerPageClient from "./CustomerPageClient";

export default function CustomerPage() {
  return (
    <Suspense
      fallback={
        <MobileFrame>
          <div className="p-6 text-center text-stone-500">
            読み込み中...
          </div>
        </MobileFrame>
      }
    >
      <CustomerPageClient />
    </Suspense>
  );
}
