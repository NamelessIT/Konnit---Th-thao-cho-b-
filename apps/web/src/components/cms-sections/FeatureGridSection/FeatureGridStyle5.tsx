import type { SectionProps } from "@konnit/ui";
import { normalizeCmsLinkValue } from "@konnit/types";
import { CmsLink, Eyebrow, Gallery } from "../_shared";

interface Item {
  icon?: string;
  title?: string;
  description?: string;
}

/**
 * Feature grid — numbered panel (demo `.community-panel`).
 * Pink panel: heading + gallery + CTA on the left, numbered cards on the right.
 */
export function FeatureGridStyle5({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;
  const cta = normalizeCmsLinkValue(c.primaryCta);

  return (
    <section className="px-4 pt-[86px]">
      <div className="mx-auto grid max-w-[1180px] gap-[34px] rounded-[var(--radius)] border border-[var(--line)] bg-[var(--konnit-pink-02)] p-[34px] md:grid-cols-[minmax(0,0.92fr)_minmax(320px,1.08fr)]">
        {/* Left: heading + gallery + CTA */}
        <div className="grid content-start gap-3">
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
              className="btn-shine mt-2 inline-flex min-h-[44px] w-max min-w-[160px] items-center justify-center rounded-[var(--radius)] bg-[var(--konnit-berry)] px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
            >
              {cta.label}
            </CmsLink>
          )}
          <Gallery
            caption="Community photos"
            tint="mint"
            className="mt-2"
            items={((c.photos as string[]) ?? []).map((src) => ({ src }))}
          />
        </div>

        {/* Right: numbered cards */}
        <div className="grid gap-3.5">
          {items.map((item, i) => (
            <article
              key={i}
              className="hover-lift rise-in grid grid-cols-[50px_1fr] gap-3.5 rounded-[var(--radius)] border border-[var(--line)] bg-white/80 p-[18px]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="row-span-2 grid h-[50px] w-[50px] place-items-center rounded-full bg-[var(--konnit-berry)] text-sm font-extrabold text-white">
                {item.icon || String(i + 1).padStart(2, "0")}
              </span>
              {item.title && (
                <h3 className="col-start-2 text-2xl font-extrabold leading-tight text-[var(--konnit-ink)]">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="col-start-2 text-[17px] font-bold leading-snug text-[var(--konnit-muted)]">
                  {item.description}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
