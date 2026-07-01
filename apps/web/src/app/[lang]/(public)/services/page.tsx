import { CmsPageView } from "@/components/cms-sections/CmsPageView";

export const metadata = {
  title: "Our Business",
  description: "Konnit learning services — movement, nature, and playful science.",
};

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CmsPageView category="landing" slug="services" locale={lang} />;
}
