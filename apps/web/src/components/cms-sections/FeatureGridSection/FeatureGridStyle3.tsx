import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string }

export function FeatureGridStyle3({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {((c.title as string) || title) && (
          <h2 className="mb-8 text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="rise-in group flex items-start gap-5 rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-[var(--konnit-pink-03)] hover:bg-[var(--konnit-pink-01)]"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--konnit-berry)] text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-1">
                {item.title && (
                  <h3 className="font-semibold text-[var(--konnit-ink)]">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="mt-1 text-sm text-[var(--konnit-muted)]">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
