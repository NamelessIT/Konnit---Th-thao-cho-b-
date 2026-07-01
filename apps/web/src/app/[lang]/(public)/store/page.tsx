import { CmsPageView } from "@/components/cms-sections/CmsPageView";

export const metadata = {
  title: "Konnit Store",
  description: "Play-ready kits for safe little adventures — catalog preview.",
};

export default function StorePage() {
  return <CmsPageView category="landing" slug="store" />;
}
