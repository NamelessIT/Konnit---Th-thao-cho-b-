import type { SectionProps } from "@konnit/ui";
import { Eyebrow, Gallery } from "../_shared";

/**
 * Image + text — gallery panel (demo `.event-gallery-panel`).
 * Heading copy on the left, a large floating photo gallery on the right.
 */
export function ImageTextStyle5({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;
  const photos = (c.photos as string[]) ?? [];

  return (
    <section className="px-4 pt-[86px]">
      <div className="mx-auto grid max-w-[1180px] items-center gap-[26px] rounded-[var(--radius)] panel-mint p-[34px] md:grid-cols-[minmax(0,0.7fr)_minmax(360px,1fr)]">
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
        <Gallery
          caption="Community photos"
          tint="pink"
          height={340}
          className="my-0"
          items={photos.map((label) => ({ label }))}
        />
      </div>
    </section>
  );
}
