import { redirect } from "next/navigation";

type StorePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StoreLandingPage({ params }: StorePageProps) {
  const { slug } = await params;

  redirect(`/s/${slug}/booking`);
}
