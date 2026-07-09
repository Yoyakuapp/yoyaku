import Link from "next/link";

import MobileFrame from "@/components/layout/MobileFrame";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { adminStaffList } from "@/data/adminStaffData";

export default function StaffPage() {
  return (
    <MobileFrame>
      <div className="space-y-4 pb-8">
        <Link href="/admin" className="text-sm font-bold text-stone-500">
          ← 管理画面
        </Link>

        <Card>
          <p className="text-sm font-bold text-green-800">Yoyaku Admin</p>
          <h1 className="mt-1 text-3xl font-bold text-stone-900">
            施術者管理
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            施術者の登録・編集・稼働状態を管理します。
          </p>
        </Card>

        <Link href="/admin/staff/new">
          <Button>新しい施術者を登録</Button>
        </Link>

        <div className="space-y-3">
          {adminStaffList.map((person) => (
            <Card key={person.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">
                    {person.name}
                  </h2>
                  <p className="text-sm text-stone-500">{person.label}</p>
                </div>

                <span
                  className={
                    person.active
                      ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800"
                      : "rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500"
                  }
                >
                  {person.active ? "稼働中" : "停止中"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {person.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href={`/admin/staff/${person.id}`}>
                  <Button variant="secondary">編集</Button>
                </Link>

                <Button variant="secondary">停止</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}