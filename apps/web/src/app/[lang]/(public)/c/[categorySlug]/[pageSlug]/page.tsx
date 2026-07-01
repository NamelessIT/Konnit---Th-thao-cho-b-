import { LocaleLink } from "@/components/i18n/LocaleLink";
import { SectionRenderer } from "@/components/cms-sections/SectionRenderer";

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
  id: string;
  title: string;
  slug: string;
  description?: string;
  category_name?: string;
  sections: SectionData[];
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ lang: string; categorySlug: string; pageSlug: string }>;
}) {
  const { lang, categorySlug, pageSlug } = await params;

  let page: PageData | null = null;
  try {
    const res = await fetch(
      `${API}/api/public/cms/pages/${categorySlug}/${pageSlug}?locale=${lang}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const json = await res.json();
      page = (json.data as PageData) ?? null;
    }
  } catch {
    page = null;
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
        <LocaleLink href="/tin-tuc" className="text-primary mt-4 inline-block hover:underline">
          ← Quay lại danh mục
        </LocaleLink>
      </div>
    );
  }

  return (
    <main>
      <nav className="rise-in mx-auto flex max-w-5xl items-center gap-2 px-4 pt-6 pb-2 text-sm text-[var(--konnit-muted)]">
        <LocaleLink href="/tin-tuc" className="transition-colors hover:text-[var(--konnit-berry)]">
          Tin tức
        </LocaleLink>
        <span className="text-[var(--konnit-pink-04)]">/</span>
        <LocaleLink
          href={`/c/${categorySlug}`}
          className="transition-colors hover:text-[var(--konnit-berry)]"
        >
          {page.category_name ?? categorySlug}
        </LocaleLink>
        <span className="text-[var(--konnit-pink-04)]">/</span>
        <span className="font-medium text-[var(--konnit-ink)]">{page.title}</span>
      </nav>
      <SectionRenderer sections={page.sections} />
    </main>
  );
}