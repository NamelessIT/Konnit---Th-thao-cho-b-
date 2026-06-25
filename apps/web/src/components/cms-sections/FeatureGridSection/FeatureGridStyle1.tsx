import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string; icon?: string }

export function FeatureGridStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {((c.title as string) || title) && (
          <h2 className="mb-10 text-center text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="hover-lift rise-in group rounded-2xl border border-[var(--konnit-pink-03)] bg-card p-7 text-center shadow-sm"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {item.icon && (
                <span className="mb-4 inline-grid h-14 w-14 place-items-center rounded-2xl bg-[var(--konnit-berry)]/15 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  {item.icon}
                </span>
              )}
              {item.title && (
                <h3 className="text-lg font-semibold text-[var(--konnit-ink)]">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="mt-2 text-sm text-[var(--konnit-muted)]">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
