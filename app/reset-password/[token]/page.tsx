import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import { getActivePasswordResetToken } from "@/lib/passwordResetTokens";
import ResetPasswordForm from "./ResetPasswordForm";

type ResetPasswordPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;
  const record = await getActivePasswordResetToken(token);

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        {record ? (
          <>
            <Card>
              <p className="text-sm font-bold text-green-800">
                Yoyakus Admin
              </p>

              <h1 className="mt-2 text-2xl font-bold text-stone-900">
                新しいパスワードを設定
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                新しいパスワードを入力してください。
              </p>
            </Card>

            <ResetPasswordForm token={token} />
          </>
        ) : (
          <Card>
            <p className="font-bold text-red-700">
              このリンクは無効か、既に使用済み・期限切れです。
            </p>

            <p className="mt-2 text-sm text-stone-500">
              お手数ですが、もう一度パスワード再設定をお申し込みください。
            </p>
          </Card>
        )}
      </div>
    </MobileFrame>
  );
}
