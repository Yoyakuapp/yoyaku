export default function StoreHeader() {
  return (
    <section className="overflow-hidden rounded-[32px] bg-white shadow-xl">
      <div className="relative h-40 bg-gradient-to-br from-[#2b241d] via-[#5f4b36] to-[#c9ad7f] text-white">
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 flex h-full flex-col justify-end p-4">
          <p className="text-xs text-white/80">Sakura</p>

          <h1 className="font-serif text-3xl leading-tight">
            Thai Massage
          </h1>

          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-yellow-400">★★★★★</span>
            <span>4.8</span>
            <span className="text-white/80">245 reviews</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/90">
            <span className="rounded-full bg-white/15 px-3 py-1">完全個室</span>
            <span className="rounded-full bg-white/15 px-3 py-1">本場タイ式</span>
            <span className="rounded-full bg-white/15 px-3 py-1">徒歩3分</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <p className="font-bold text-green-800">営業中</p>
          <p className="text-sm text-stone-500">10:00〜20:00</p>
        </div>

        <p className="text-sm text-stone-500">最短45分で予約可</p>
      </div>
    </section>
  );
}