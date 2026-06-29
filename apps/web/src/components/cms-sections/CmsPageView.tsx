import Link from "next/link";
import { SectionRenderer } from "./SectionRenderer";

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

/**
 * Fetches a published CMS page by category/slug and renders its sections.
 * Used by the top-level public landing routes (services / store / community).
 */
export async function CmsPageView({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {
  const res = await fetch(`${API}/api/public/cms/pages/${category}/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-[var(--konnit-ink)]">Không tìm thấy trang</h1>
        <Link href="/" className="mt-4 inline-block font-extrabold text-[var(--konnit-berry)] hover:underline">
          ← Về trang chủ
        </Link>
      </div>
    );
  }

  const json = await res.json();
  const sections: SectionData[] = json.data?.sections ?? [];
  return <SectionRenderer sections={sections} />;
}
