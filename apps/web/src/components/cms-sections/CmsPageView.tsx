import { LocaleLink } from "@/components/i18n/LocaleLink";
import { getDictionary, tFrom } from "@/lib/i18n/dictionaries";
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
  locale,
}: {
  category: string;
  slug: string;
  locale?: string;
}) {
  const t = tFrom(await getDictionary(locale));
  let sections: SectionData[];
  const qs = locale ? `?locale=${locale}` : "";
  try {
    const res = await fetch(`${API}/api/public/cms/pages/${category}/${slug}${qs}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-(--konnit-ink)">{t("common.notFound")}</h1>
          <LocaleLink href="/" className="mt-4 inline-block font-extrabold text-(--konnit-berry) hover:underline">
            ← {t("common.home")}
          </LocaleLink>
        </div>
      );
    }

    const json = await res.json();
    sections = json.data?.sections ?? [];
  } catch {
    // API tạm không truy cập được (vd lúc build) → không làm crash prerender;
    // ISR (revalidate 60s) sẽ tải lại nội dung khi API sẵn sàng.
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-(--konnit-ink)">{t("common.updating")}</h1>
        <LocaleLink href="/" className="mt-4 inline-block font-extrabold text-(--konnit-berry) hover:underline">
          ← {t("common.home")}
        </LocaleLink>
      </div>
    );
  }

  return <SectionRenderer sections={sections} />;
}
