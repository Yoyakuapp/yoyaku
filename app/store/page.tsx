import Image from "next/image";
import { storeImages } from "@/data/storeImages";

export default function StorePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <Card className="space-y-3">
        <h1 className="text-2xl font-bold text-stone-900">店舗詳細</h1>
        <p className="text-sm text-stone-600">
          店舗情報、写真、予約可能な時間を確認できます。
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-bold text-stone-900">店舗写真</h2>

        <div className="grid grid-cols-2 gap-3">
          {storeImages.map((image) => (
            <div
              key={image.src}
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 240px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}