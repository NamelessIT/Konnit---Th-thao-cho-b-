import type { MetadataRoute } from "next";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  // Loại vé đang publish → /cua-hang/:id
  const tickets = await fetchData<TicketLite[]>("/api/public/ticket-types");
  for (const t of tickets ?? []) {
    entries.push({
      url: `${SITE_URL}/cua-hang/${t.id}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Trang CMS publish (trừ category 'landing' đã có route tĩnh) → /c/:cat/:page
  const categories = await fetchData<CategoryLite[]>("/api/public/cms/categories");
  for (const cat of categories ?? []) {
    if (cat.slug === "landing") continue;
    const detail = await fetchData<CategoryDetail>(`/api/public/cms/categories/${cat.slug}`);
    for (const p of detail?.pages ?? []) {
      entries.push({
        url: `${SITE_URL}/c/${cat.slug}/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
