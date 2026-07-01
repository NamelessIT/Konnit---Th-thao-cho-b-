import type { SectionProps } from "@konnit/ui";
import { CmsLink, Eyebrow, Gallery, FactsList, type GalleryTint, type Fact } from "../_shared";

interface Item {
  tag?: string;
  tint?: GalleryTint;
  title?: string;
  description?: string;
  ageFit?: string;
  safetyNote?: string;
  included?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  photos?: string[];
}

/**
 * Product — kit card with facts (demo store `.kit-grid` / `.kit-card`).
 * 2-up cards: tag + gallery + facts list (age/safety/included) + primary CTA button.
 */
export function ProductStyle2({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;
  const cta = c.primaryCta as { label?: string; url?: string } | undefined;

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
        </div>

        <div className="mt-6 grid gap-[18px] md:grid-cols-2">
          {items.map((item, i) => {
            const facts: Fact[] = [
              { label: "Age fit", value: item.ageFit },
              { label: "Safety note", value: item.safetyNote },
              { label: "Included", value: item.included },
            ];
            return (
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
                  caption="Product preview"
                  tint={item.tint ?? "pink"}
                  height={252}
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
                <FactsList facts={facts} />
                {item.ctaLabel && (
                  <CmsLink
                    value={{ label: item.ctaLabel, url: item.ctaUrl }}
                    className="btn-shine mt-0.5 inline-flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius)] bg-[var(--konnit-berry)] px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
                  >
                    {item.ctaLabel}
                  </CmsLink>
                )}
              </article>
            );
          })}
        </div>

        {cta?.label && (
          <div className="mt-12 pb-2 text-center">
            <CmsLink
              value={cta}
              className="btn-shine inline-flex min-h-[44px] min-w-[200px] items-center justify-center rounded-[var(--radius)] bg-[var(--konnit-berry)] px-6 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
            >
              {cta.label}
            </CmsLink>
          </div>
        )}
      </div>
    </section>
  );
}
