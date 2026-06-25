import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string; time?: string }

export function ScheduleStyle3({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {((c.title as string) || title) && (
          <h2 className="mb-8 text-center text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="hover-lift rise-in rounded-2xl border border-[var(--konnit-pink-03)] bg-card p-5"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {item.time && (
                <p className="mb-1 inline-block rounded-full bg-[var(--konnit-pink-02)] px-3 py-0.5 text-xs font-semibold text-[var(--konnit-berry)]">
                  {item.time}
                </p>
              )}
              {item.title && (
                <h3 className="font-semibold text-[var(--konnit-ink)]">{item.title}</h3>
              )}
              {item.description && (
                <p className="mt-1 text-sm text-[var(--konnit-muted)]">
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
