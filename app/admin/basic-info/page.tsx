import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BasicInfoPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>

          <h1 className="mt-2 text-3xl font-bold text-stone-900">
            基本情報管理
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            店舗の基本情報や、お客様に表示するメニューを管理します。
          </p>
        </Card>

        <div className="space-y-3">
          <Link href="/admin/store">
            <Button variant="secondary">店舗情報</Button>
          </Link>

          <Link href="/admin/menu">
            <Button variant="secondary">メニュー管理</Button>
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
