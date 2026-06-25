import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string }

export function FAQStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  const mid = Math.ceil(items.length / 2);
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {((c.title as string) || title) && (
          <h2 className="mb-10 text-center text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {[items.slice(0, mid), items.slice(mid)].map((col, ci) => (
            <div key={ci} className="space-y-4">
              {col.map((item, i) => (
                <div
                  key={i}
                  className="rise-in rounded-2xl border border-[var(--konnit-pink-03)] bg-card p-5 transition-shadow duration-300 hover:shadow-md"
                  style={{ animationDelay: `${(ci * mid + i) * 0.06}s` }}
                >
                  <h3 className="font-semibold text-[var(--konnit-ink)]">
                    {item.title ?? ""}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--konnit-muted)]">
                    {item.description ?? ""}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
