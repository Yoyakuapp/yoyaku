import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import { getActiveStoreInvite } from "@/lib/storeInvites";
import SignupForm from "./SignupForm";

type SignupPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SignupPage({ params }: SignupPageProps) {
  const { token } = await params;
  const invite = await getActiveStoreInvite(token);

  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-sm font-bold tracking-widest text-green-800">
            Yoyakus
          </p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            店舗登録
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            必要な項目を入力すると、すぐに管理画面が使えるようになります。
          </p>
        </Card>

        {invite ? (
          <SignupForm token={token} />
        ) : (
          <Card>
            <p className="font-bold text-red-700">
              この招待リンクは無効か、既に使用されています。
            </p>

            <p className="mt-2 text-sm text-stone-500">
              お手数ですが、招待リンクを発行した担当者にご確認ください。
            </p>
          </Card>
        )}
      </div>
    </MobileFrame>
  );
}
