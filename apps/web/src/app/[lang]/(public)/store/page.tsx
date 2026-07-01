import { CmsPageView } from "@/components/cms-sections/CmsPageView";

export const metadata = {
  title: "Konnit Store",
  description: "Play-ready kits for safe little adventures — catalog preview.",
};

export default async function StorePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CmsPageView category="landing" slug="store" locale={lang} />;
}
