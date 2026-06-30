import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  published_at?: string;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  pages: Page[];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  let category: CategoryData | null = null;
  try {
    const res = await fetch(`${API}/api/public/cms/categories/${categorySlug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      category = (json.data as CategoryData) ?? null;
    }
  } catch {
    category = null;
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy danh mục</h1>
        <Link
          href="/tin-tuc"
          className="mt-4 inline-block text-[var(--konnit-pink-05)] hover:underline"
        >
          ← Quay lại danh mục
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <nav className="rise-in mb-6 flex items-center gap-2 text-sm text-[var(--konnit-muted)]">
        <Link href="/tin-tuc" className="transition-colors hover:text-[var(--konnit-berry)]">
          Tin tức
        </Link>
        <span className="text-[var(--konnit-pink-04)]">/</span>
        <span className="font-medium text-[var(--konnit-ink)]">{category.name}</span>
      </nav>

      <header className="rise-in" style={{ animationDelay: "0.05s" }}>
        <h1 className="text-4xl font-extrabold text-[var(--konnit-ink)]">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-3 max-w-2xl text-[var(--konnit-muted)]">
            {category.description}
          </p>
        )}
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {category.pages.map((page, i) => (
          <Link
            key={page.id}
            href={`/c/${categorySlug}/${page.slug}`}
            className="hover-lift rise-in group block rounded-2xl border border-[var(--konnit-pink-03)] bg-card p-7"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--konnit-ink)] transition-colors group-hover:text-[var(--konnit-berry)]">
                {page.title}
              </h2>
              <span className="mt-1 text-[var(--konnit-pink-05)] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </div>
            {page.description && (
              <p className="mt-2 text-sm text-[var(--konnit-muted)]">
                {page.description}
              </p>
            )}
          </Link>
        ))}

        {category.pages.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-[var(--konnit-pink-03)] py-16 text-center text-[var(--konnit-muted)]">
            Chưa có trang nào trong danh mục này
          </div>
        )}
      </div>
    </div>
  );
}
