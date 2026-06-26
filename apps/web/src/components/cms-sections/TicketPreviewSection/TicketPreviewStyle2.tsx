import Link from "next/link";
import type { SectionProps } from "@konnit/ui";

interface Item {
  title?: string;
  description?: string;
  price?: string;
  ticketTypeId?: string;
  eventSlug?: string;
}

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
                <th className="px-5 py-3 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const ticketHref = item.ticketTypeId
                  ? `/cua-hang#ticket-${item.ticketTypeId}`
                  : item.eventSlug
                    ? `/cua-hang`
                    : "/cua-hang";

                return (
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
                    <td className="px-5 py-3 text-center">
                      <Link
                        href={ticketHref}
                        className="inline-block rounded-lg bg-[var(--konnit-berry)] px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                      >
                        Mua vé
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}