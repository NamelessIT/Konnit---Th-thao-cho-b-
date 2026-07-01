import type { MetadataRoute } from "next";
import { FALLBACK_LOCALES } from "@/lib/i18n/config";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

// Cache sitemap 1h — không query DB mỗi lần bot ghé.
export const revalidate = 3600;

const STATIC_ROUTES = ["", "/services", "/community", "/store", "/cua-hang", "/tin-tuc"];

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; data?: T };
    return json?.success ? (json.data ?? null) : null;
  } catch {
    // API tạm down → không làm build/sitemap crash, chỉ trả ít URL hơn.
    return null;
  }
}

type TicketLite = { id: number; updated_at?: string | null };
type CategoryLite = { slug: string };
type CategoryDetail = { pages?: { slug: string; updated_at?: string | null }[] };
type PublicLanguage = { code: string };

/** hreflang alternates: mỗi path phát ra cho toàn bộ locale. */
function alternates(path: string, locales: string[]) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}/${l}${path}`;
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const langs = await fetchData<PublicLanguage[]>("/api/public/languages");
  const locales = langs?.length ? langs.map((l) => l.code) : [...FALLBACK_LOCALES];

  const entries: MetadataRoute.Sitemap = [];

  const push = (
    path: string,
    lastModified: Date,
    changeFrequency: "weekly" | "monthly",
    priority: number,
  ) => {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified,
        changeFrequency,
        priority,
        alternates: alternates(path, locales),
      });
    }
  };

  for (const route of STATIC_ROUTES) {
    push(route || "", now, "weekly", route === "" ? 1 : 0.8);
  }

  // Loại vé đang publish → /:locale/cua-hang/:id
  const tickets = await fetchData<TicketLite[]>("/api/public/ticket-types");
  for (const t of tickets ?? []) {
    push(`/cua-hang/${t.id}`, t.updated_at ? new Date(t.updated_at) : now, "weekly", 0.7);
  }

  // Trang CMS publish (trừ category 'landing') → /:locale/c/:cat/:page
  const categories = await fetchData<CategoryLite[]>("/api/public/cms/categories");
  for (const cat of categories ?? []) {
    if (cat.slug === "landing") continue;
    const detail = await fetchData<CategoryDetail>(`/api/public/cms/categories/${cat.slug}`);
    for (const p of detail?.pages ?? []) {
      push(`/c/${cat.slug}/${p.slug}`, p.updated_at ? new Date(p.updated_at) : now, "monthly", 0.6);
    }
  }

  return entries;
}
