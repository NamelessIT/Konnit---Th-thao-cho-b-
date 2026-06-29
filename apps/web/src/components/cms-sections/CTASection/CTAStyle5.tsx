import type { SectionProps } from "@konnit/ui";
import { Eyebrow } from "../_shared";

interface Cta {
  label?: string;
  url?: string;
}

/**
 * CTA — two-column panel (demo `.mission-card` / `.store-cta-panel`).
 * Heading on the left; on the right a note block and/or stacked action buttons.
 */
export function CTAStyle5({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;
  const note = c.note as string | undefined;
  const noteLabel = c.noteLabel as string | undefined;
  const primary = c.primaryCta as Cta | undefined;
  const secondary = c.secondaryCta as Cta | undefined;
  const hasActions = primary?.label || secondary?.label;

  return (
    <section className="px-4 pt-[86px]">
      <div className="mx-auto grid max-w-[1180px] items-center gap-[30px] rounded-[var(--radius)] panel-mint p-[34px] md:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)]">
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

        <div className="grid gap-3">
          {note && (
            <div className="grid gap-2.5 rounded-[var(--radius)] border border-[var(--line)] bg-white/85 p-5">
              {noteLabel && <span className="pill">{noteLabel}</span>}
              <p className="text-[17px] font-bold leading-snug text-[var(--konnit-muted)]">
                {note}
              </p>
            </div>
          )}
          {hasActions && (
            <div className="grid gap-3">
              {primary?.label && (
                <a
                  href={primary.url || "#"}
                  className="btn-shine inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius)] bg-[var(--konnit-berry)] px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
                >
                  {primary.label}
                </a>
              )}
              {secondary?.label && (
                <a
                  href={secondary.url || "#"}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius)] border-2 border-[var(--line)] bg-white/80 px-5 font-extrabold text-[var(--konnit-berry)] transition-transform hover:-translate-y-0.5"
                >
                  {secondary.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
