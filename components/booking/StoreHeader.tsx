type StoreHeaderProps = {
  store: {
    name: string;
    phone: string | null;
  } | null;
};

export default function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-white shadow-xl">
      <div className="relative h-40 bg-gradient-to-br from-[#2b241d] via-[#5f4b36] to-[#c9ad7f] text-white">
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 flex h-full flex-col justify-end p-4">
          <h1 className="font-serif text-3xl leading-tight">
            {store?.name ?? "読み込み中..."}
          </h1>
        </div>
      </div>

      {store?.phone ? (
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm text-stone-500">お問い合わせ: {store.phone}</p>
        </div>
      ) : null}
    </section>
  );
}

