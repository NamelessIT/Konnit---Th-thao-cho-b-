import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string; icon?: string }

export function FeatureGridStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="bg-[var(--konnit-pink-01)] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {((c.title as string) || title) && (
          <h2 className="mb-10 text-center text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="rise-in group flex flex-col items-center gap-3 rounded-2xl p-5 transition-colors duration-300 hover:bg-white"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {item.icon && (
                <span className="text-4xl transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
                  {item.icon}
                </span>
              )}
              {item.title && (
                <p className="text-center text-sm font-medium text-[var(--konnit-ink)]">
                  {item.title}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
