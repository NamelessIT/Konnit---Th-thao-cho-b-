import type { SectionProps } from "@konnit/ui";
import { normalizeCmsLinkValue } from "@konnit/types";
import { CmsLink, Eyebrow, Gallery, type GalleryTint } from "../_shared";

interface Item {
  tag?: string;
  tint?: GalleryTint;
  title?: string;
  description?: string;
  ageFit?: string;
  safetyNote?: string;
  linkLabel?: string;
  linkUrl?: string;
  photos?: string[];
}

/**
 * Product — compact catalog grid (demo home `.store-grid` / `.product-card`).
 * 4-up cards: tag + gallery + title + description + age/safety meta + view link.
 */
export function ProductStyle1({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;
  const cta = normalizeCmsLinkValue(c.primaryCta);

  return (
    <section className="px-4 pt-[86px]">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-3">
          {c.eyebrow && <Eyebrow>{c.eyebrow as string}</Eyebrow>}
          {heading && (
            <h2 className="max-w-[820px] text-[clamp(31px,4.8vw,54px)] font-extrabold leading-tight text-[var(--konnit-ink)]">
              {heading}
            </h2>
          )}
          {lead && (
            <p className="max-w-[760px] text-xl font-bold leading-relaxed text-[var(--konnit-muted)]">
              {lead}
            </p>
          )}
          {cta?.label && (
            <CmsLink
              value={cta}
              className="btn-shine mt-1 inline-flex min-h-[44px] w-max min-w-[160px] items-center justify-center rounded-[var(--radius)] bg-[var(--konnit-berry)] px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
            >
              {cta.label}
            </CmsLink>
          )}
        </div>

        <div className="mt-[30px] grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <article
              key={i}
              className="hover-lift rise-in grid content-start gap-3.5 rounded-[var(--radius)] border border-[var(--line)] bg-[linear-gradient(180deg,var(--card),#fffafd)] p-[22px] shadow-[var(--shadow-card)]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {item.tag && (
                <span className="w-max rounded-[var(--radius)] bg-[var(--konnit-pink-02)] px-2.5 py-2 text-[13px] font-extrabold text-[var(--konnit-berry)]">
                  {item.tag}
                </span>
              )}
              <Gallery
                caption="Product photos"
                tint={item.tint ?? "pink"}
                items={(item.photos ?? []).map((src) => ({ src }))}
              />
              {item.title && (
                <h3 className="text-2xl font-extrabold leading-tight text-[var(--konnit-ink)]">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="text-[17px] font-bold leading-snug text-[var(--konnit-muted)]">
                  {item.description}
                </p>
              )}
              {(item.ageFit || item.safetyNote) && (
                <div className="mt-auto grid gap-1.5 text-sm">
                  {item.ageFit && (
                    <span className="border-t border-[var(--line)] pt-2 font-bold text-[var(--konnit-muted)]">
                      Age fit: {item.ageFit}
                    </span>
                  )}
                  {item.safetyNote && (
                    <span className="border-t border-[var(--line)] pt-2 font-bold text-[var(--konnit-muted)]">
                      Safety note: {item.safetyNote}
                    </span>
                  )}
                </div>
              )}
              {item.linkLabel && (
                <CmsLink
                  value={{ label: item.linkLabel, url: item.linkUrl }}
                  className="link-underline w-max font-extrabold text-[var(--konnit-berry)]"
                >
                  {item.linkLabel}
                </CmsLink>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
