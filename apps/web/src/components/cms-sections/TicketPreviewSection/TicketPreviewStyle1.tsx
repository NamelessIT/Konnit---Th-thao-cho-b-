"use client";

import type { SectionProps } from "@konnit/ui";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useT } from "@/lib/i18n/LocaleProvider";

interface Item {
  title?: string;
  description?: string;
  price?: string;
  ticketTypeId?: string;
  eventSlug?: string;
}

export function TicketPreviewStyle1({ contentJson, title }: SectionProps) {
  const t = useT();
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        {((c.title as string) || title) && (
          <h2 className="mb-10 text-center text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, i) => {
            const ticketHref = item.ticketTypeId
              ? `/cua-hang#ticket-${item.ticketTypeId}`
              : item.eventSlug
                ? `/cua-hang` // hoặc `/su-kien/${item.eventSlug}`
                : "/cua-hang";

            return (
              <div
                key={i}
                className="hover-lift rise-in group flex flex-col rounded-2xl border border-[var(--konnit-pink-03)] bg-card p-7 text-center"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {item.title && (
                  <h3 className="font-semibold text-[var(--konnit-ink)]">
                    {item.title}
                  </h3>
                )}
                {item.price && (
                  <p className="mt-3 text-3xl font-extrabold text-[var(--konnit-berry)]">
                    {item.price}
                  </p>
                )}
                {item.description && (
                  <p className="mt-3 text-sm text-[var(--konnit-muted)]">
                    {item.description}
                  </p>
                )}
                <div className="mt-5">
                  <LocaleLink
                    href={ticketHref}
                    className="inline-block rounded-xl bg-[var(--konnit-berry)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    {t("shop.buyTicket")}
                  </LocaleLink>
                </div>
              </div>
            );
          })}
        </div>
        {c.note && (
          <p className="mt-6 text-center text-sm italic text-[var(--konnit-muted)]">
            {c.note as string}
          </p>
        )}
      </div>
    </section>
  );
}