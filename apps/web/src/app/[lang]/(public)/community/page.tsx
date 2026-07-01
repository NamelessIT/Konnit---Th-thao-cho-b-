import { CmsPageView } from "@/components/cms-sections/CmsPageView";

export const metadata = {
  title: "Our Community",
  description: "Konnit community days — kinder days for children and families.",
};

export default async function CommunityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <CmsPageView category="landing" slug="community" locale={lang} />;
}
