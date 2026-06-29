import "@/components/cms-sections/registry";
import { SectionRenderer } from "@/components/cms-sections/SectionRenderer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface SectionData {
  id: string;
  component_type: string;
  style_variant: string;
  title?: string | null;
  description?: string | null;
  content_json: Record<string, unknown>;
  sort_order: number;
}

interface PageData {
  sections: SectionData[];
}

export default async function HomePage() {
  const res = await fetch(`${API}/api/public/cms/pages/landing/home`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return (
      <>
        <PublicHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-4xl font-bold text-primary">Konnit</h1>
          <p className="text-muted-foreground">Nền tảng thể thao và hoạt động dành cho trẻ em Việt Nam</p>
        </main>
        <PublicFooter />
      </>
    );
  }

  const json = await res.json();
  const page: PageData = json.data;

  // Home hero (image-overlay) sits under the fixed header, so no top padding here.
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <SectionRenderer sections={page.sections} />
      </main>
      <PublicFooter />
    </>
  );
}
