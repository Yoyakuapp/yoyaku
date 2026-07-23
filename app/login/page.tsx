import { Suspense } from "react";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            お店の管理ページにログイン
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            管理画面を開くにはログインしてください。
          </p>
        </Card>

        <Suspense
          fallback={
            <Card>
              <p className="text-center text-sm text-stone-500">
                読み込み中...
              </p>
            </Card>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </MobileFrame>
  );
}
