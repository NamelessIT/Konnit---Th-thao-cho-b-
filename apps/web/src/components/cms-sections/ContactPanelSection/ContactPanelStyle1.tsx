import type { SectionProps } from "@konnit/ui";
import { normalizeCmsLinkValue } from "@konnit/types";
import { CmsLink, ContactCard } from "../_shared";

/**
 * Contact panel — card + copy (demo `.contact-panel`).
 * QR contact card on the left, lead copy + two CTAs on the right.
 */
export function ContactPanelStyle1({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const lead = (c.description as string) || description;
  const primary = normalizeCmsLinkValue(c.primaryCta);
  const secondary = normalizeCmsLinkValue(c.secondaryCta);

  return (
    <section className="px-4 pt-[86px]">
      <div className="mx-auto grid max-w-[1180px] items-center gap-6 rounded-[var(--radius)] panel-pink p-[30px] md:grid-cols-[minmax(300px,0.42fr)_minmax(0,1fr)]">
        <ContactCard
          label={c.label as string | undefined}
          title={(c.title as string) || title || undefined}
          phone={c.phone as string | undefined}
          qrData={c.qrData as string | undefined}
          qrImage={c.qrImage as string | undefined}
          className="bg-white/90"
        />
        <div className="grid gap-3.5">
          {lead && (
            <p className="max-w-[760px] text-xl font-bold leading-relaxed text-[var(--konnit-muted)]">
              {lead}
            </p>
          )}
          {(primary?.label || secondary?.label) && (
            <div className="flex flex-wrap gap-3 pt-1.5">
              {primary?.label && (
                <CmsLink
                  value={primary}
                  className="btn-shine inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-[var(--radius)] bg-[var(--konnit-berry)] px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
                >
                  {primary.label}
                </CmsLink>
              )}
              {secondary?.label && (
                <CmsLink
                  value={secondary}
                  className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-[var(--radius)] border-2 border-[var(--line)] bg-white/80 px-5 font-extrabold text-[var(--konnit-berry)] transition-transform hover:-translate-y-0.5"
                >
                  {secondary.label}
                </CmsLink>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
