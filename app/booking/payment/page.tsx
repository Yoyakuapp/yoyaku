import { Suspense } from "react";

import MobileFrame from "@/components/layout/MobileFrame";
import PaymentPageClient from "./PaymentPageClient";

export default function PaymentPage() {
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
      <PaymentPageClient />
    </Suspense>
  );
}
