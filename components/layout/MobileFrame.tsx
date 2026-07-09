type MobileFrameProps = {
  children: React.ReactNode;
};

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <main className="min-h-screen bg-stone-100 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-stone-100 px-4 py-4">
        {children}
      </div>
    </main>
  );
}