import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import ApplyForm from "./ApplyForm";

export default function ApplyPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Card>
          <p className="text-sm font-bold tracking-widest text-green-800">
            Yoyakus
          </p>

          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            利用のお申し込み
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Yoyakusの利用をご希望の店舗様は、以下のフォームからお申し込みください。ご入力いただいたメールアドレス宛に、店舗登録用のご案内をお送りします。
          </p>
        </Card>

        <ApplyForm />
      </div>
    </MobileFrame>
  );
}
