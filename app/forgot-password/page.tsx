import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-sm font-bold text-green-800">Yoyakus Admin</p>

          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            パスワードをお忘れの方
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをメールでお送りします。
          </p>
        </Card>

        <ForgotPasswordForm />
      </div>
    </MobileFrame>
  );
}
