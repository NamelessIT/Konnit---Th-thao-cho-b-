import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string; time?: string }

export function ScheduleStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {((c.title as string) || title) && (
          <h2 className="mb-10 text-center text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="relative space-y-8 border-l-2 border-[var(--konnit-pink-03)] pl-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="rise-in group relative"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="absolute -left-[2.35rem] top-1 grid h-4 w-4 place-items-center rounded-full bg-[var(--konnit-berry)] ring-4 ring-[var(--konnit-pink-01)] transition-transform duration-300 group-hover:scale-125" />
              {item.time && (
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--konnit-pink-05)]">
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
