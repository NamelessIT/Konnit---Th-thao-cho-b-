import { LocaleLink } from "@/components/i18n/LocaleLink";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default async function TinTucPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  let categories: Category[] = [];

  try {
    const res = await fetch(`${API}/api/public/cms/categories?locale=${lang}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      categories = json.data ?? [];
    }
  } catch {
    // API not available
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="rise-in text-center">
        <span className="inline-block rounded-full bg-[var(--konnit-pink-02)] px-4 py-1 text-sm font-medium text-[var(--konnit-berry)]">
          Konnit
        </span>
        <h1 className="gradient-text mt-4 text-4xl font-extrabold md:text-5xl">
          Tin tức &amp; Sự kiện
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[var(--konnit-muted)]">
          Khám phá các hoạt động, giải đấu và câu chuyện từ cộng đồng Konnit.
        </p>
      </header>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {categories.map((cat, i) => (
          <LocaleLink
            key={cat.id}
            href={`/c/${cat.slug}`}
            className="hover-lift rise-in group block rounded-2xl border border-[var(--konnit-pink-03)] bg-card p-7"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--konnit-ink)] transition-colors group-hover:text-[var(--konnit-berry)]">
                {cat.name}
              </h2>
              <span className="mt-1 text-[var(--konnit-pink-05)] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
            {cat.description && (
              <p className="mt-2 text-sm text-[var(--konnit-muted)]">
                {cat.description}
              </p>
            )}
          </LocaleLink>
        ))}

        {categories.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-[var(--konnit-pink-03)] py-16 text-center text-[var(--konnit-muted)]">
            Chưa có danh mục nào được xuất bản
          </div>
        )}
      </div>
    </div>
  );
}
