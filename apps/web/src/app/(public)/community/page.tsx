import { CmsPageView } from "@/components/cms-sections/CmsPageView";

export const metadata = {
  title: "Our Community",
  description: "Konnit community days — kinder days for children and families.",
};

export default function CommunityPage() {
  return <CmsPageView category="landing" slug="community" />;
}
