import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string; time?: string }

export function ScheduleStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {((c.title as string) || title) && (
          <h2 className="mb-8 text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="rise-in overflow-hidden rounded-2xl border border-[var(--konnit-pink-03)] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--konnit-pink-02)] text-left text-[var(--konnit-berry)]">
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold">Nội dung</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  className="border-t border-[var(--konnit-pink-03)] transition-colors hover:bg-[var(--konnit-pink-01)]"
                >
                  <td className="whitespace-nowrap px-5 py-3 font-medium text-[var(--konnit-pink-05)]">
                    {item.time ?? ""}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-medium text-[var(--konnit-ink)]">
                      {item.title ?? ""}
                    </span>
                    {item.description && (
                      <span className="ml-2 text-[var(--konnit-muted)]">
                        — {item.description}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
