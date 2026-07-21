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
        {invite ? (
          <SignupForm token={token} />
        ) : (
          <Card>
            <p className="font-bold text-red-700">
              この招待リンクは無効か、既に使用されています。
              <br />
              This invite link is invalid or has already been used.
            </p>

            <p className="mt-2 text-sm text-stone-500">
              お手数ですが、招待リンクを発行した担当者にご確認ください。
              <br />
              Please contact whoever sent you this link.
            </p>
          </Card>
        )}
      </div>
    </MobileFrame>
  );
}
