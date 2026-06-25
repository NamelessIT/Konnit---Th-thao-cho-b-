import type { SectionProps } from "@konnit/ui";

interface Item { title?: string; description?: string; price?: string }

export function TicketPreviewStyle2({ contentJson, title }: SectionProps) {
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
        <div className="rise-in overflow-hidden rounded-2xl border border-[var(--konnit-pink-03)] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--konnit-pink-02)] text-left text-[var(--konnit-berry)]">
                <th className="px-5 py-3 font-semibold">Loại vé</th>
                <th className="px-5 py-3 font-semibold">Mô tả</th>
                <th className="px-5 py-3 text-right font-semibold">Giá</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  className="border-t border-[var(--konnit-pink-03)] transition-colors hover:bg-[var(--konnit-pink-01)]"
                >
                  <td className="px-5 py-3 font-medium text-[var(--konnit-ink)]">
                    {item.title ?? ""}
                  </td>
                  <td className="px-5 py-3 text-[var(--konnit-muted)]">
                    {item.description ?? ""}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[var(--konnit-pink-05)]">
                    {item.price ?? ""}
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
