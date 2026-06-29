import type { SectionProps } from "@konnit/ui";
import { Eyebrow } from "../_shared";

/**
 * CTA — panel + chips (demo `.safety-panel` / `.promise-grid`).
 * Heading on the left, a grid of short promise chips on the right.
 */
export function CTAStyle4({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;
  const chips = (c.chips as string[]) ?? [];

  return (
    <section className="px-4 pt-[86px]">
      <div className="mx-auto grid max-w-[1180px] items-center gap-6 rounded-[var(--radius)] panel-pink p-[30px] md:grid-cols-[minmax(0,1fr)_minmax(280px,0.62fr)]">
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
        {chips.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5">
            {chips.map((chip, i) => (
              <span
                key={i}
                className="flex min-h-[54px] items-center rounded-[var(--radius)] border border-[var(--line)] bg-white/85 p-3 font-extrabold text-[var(--konnit-ink)]"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
