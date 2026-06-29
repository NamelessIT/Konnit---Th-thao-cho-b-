import { CmsPageView } from "@/components/cms-sections/CmsPageView";

export const metadata = {
  title: "Our Business",
  description: "Konnit learning services — movement, nature, and playful science.",
};

export default function ServicesPage() {
  return <CmsPageView category="landing" slug="services" />;
}
