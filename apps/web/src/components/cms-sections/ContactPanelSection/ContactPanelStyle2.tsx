import type { SectionProps } from "@konnit/ui";
import { Eyebrow, ContactCard } from "../_shared";

interface Trust {
  icon?: string;
  label?: string;
}

/**
 * Contact panel — about layout (demo `.about-panel`).
 * Heading + bullet points on the left, contact card + trust pills on the right.
 */
export function ContactPanelStyle2({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;
  const bullets = (c.bullets as string[]) ?? [];
  const trust = (c.trust as Trust[]) ?? [];

  return (
    <section className="px-4 pt-11">
      <div className="mx-auto grid max-w-[1180px] items-center gap-[34px] rounded-[var(--radius)] panel-soft p-8 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.42fr)]">
        {/* Left: heading + bullets */}
        <div className="grid gap-3">
          {c.eyebrow && <Eyebrow>{c.eyebrow as string}</Eyebrow>}
          {heading && (
            <h2 className="max-w-[560px] text-[clamp(28px,3.2vw,40px)] font-extrabold leading-tight text-[var(--konnit-ink)]">
              {heading}
            </h2>
          )}
          {lead && (
            <p className="max-w-[640px] text-lg font-bold leading-relaxed text-[var(--konnit-ink)]">
              {lead}
            </p>
          )}
          {bullets.length > 0 && (
            <div className="mt-0.5 grid max-w-[660px] gap-2.5">
              {bullets.map((b, i) => (
                <span
                  key={i}
                  className="relative pl-5 text-[15px] font-bold leading-snug text-[var(--konnit-muted)] before:absolute before:left-0.5 before:top-[0.68em] before:h-[7px] before:w-[7px] before:rounded-full before:bg-[var(--konnit-berry)] before:content-['']"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: contact card + trust pills */}
        <div className="grid gap-3">
          <ContactCard
            label={c.label as string | undefined}
            title={c.contactTitle as string | undefined}
            phone={c.phone as string | undefined}
            qrImage={c.qrImage as string | undefined}
          />
          {trust.length > 0 && (
            <div className="grid justify-items-start gap-2">
              {trust.map((t, i) => (
                <div
                  key={i}
                  className="inline-flex min-h-9 w-[150px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--konnit-pink-02)] px-2.5 py-1.5 text-sm font-extrabold text-[var(--konnit-ink)]"
                >
                  <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white/70 text-[13px] text-[var(--konnit-berry)]">
                    {t.icon || "✓"}
                  </span>
                  {t.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
