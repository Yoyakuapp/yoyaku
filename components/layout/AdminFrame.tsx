import AdminLocaleSwitcher from "@/components/admin/AdminLocaleSwitcher";
import StoreTopPageLink from "@/components/admin/StoreTopPageLink";

type AdminFrameProps = {
  children: React.ReactNode;
};

export default function AdminFrame({ children }: AdminFrameProps) {
  return (
    <main className="min-h-screen bg-stone-100 flex justify-center">
      <div className="w-full max-w-[430px] md:max-w-3xl lg:max-w-5xl min-h-screen bg-stone-100 px-4 py-4 md:px-8 md:py-8">
        <AdminLocaleSwitcher />
        <StoreTopPageLink />
        {children}
      </div>
    </main>
  );
}
