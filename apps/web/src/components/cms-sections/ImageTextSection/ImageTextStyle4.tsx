import type { SectionProps } from "@konnit/ui";
import { Eyebrow, Gallery, FactsList, type GalleryTint, type Fact } from "../_shared";

interface Program {
  label?: string;
  tint?: GalleryTint;
  title?: string;
  description?: string;
  photos?: string[];
  facts?: Fact[];
}

/**
 * Image + text — program split list (demo `.program-grid` / `.program-card`).
 * Each program: gallery on the left, label + heading + copy + facts list on the right.
 */
export function ImageTextStyle4({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Program[]) ?? [];
  const heading = (c.title as string) || title;
  const lead = (c.description as string) || description;

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

        <div className="mt-[30px] grid gap-[18px]">
          {items.map((p, i) => (
            <article
              id={p.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              key={i}
              className="rise-in grid items-stretch gap-[22px] rounded-[var(--radius)] border border-[var(--line)] bg-[linear-gradient(180deg,var(--card),#fffafd)] p-[22px] shadow-[var(--shadow-card)] md:grid-cols-[minmax(280px,0.45fr)_minmax(0,1fr)]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <Gallery
                caption="Activity photos"
                tint={p.tint ?? "pink"}
                height={260}
                className="my-0 h-full"
                items={(p.photos ?? []).map((label) => ({ label }))}
              />
              <div className="grid content-start gap-3">
                {p.label && <span className="pill">{p.label}</span>}
                {p.title && (
                  <h3 className="text-[28px] font-extrabold leading-tight text-[var(--konnit-ink)]">
                    {p.title}
                  </h3>
                )}
                {p.description && (
                  <p className="text-[17px] font-bold leading-snug text-[var(--konnit-muted)]">
                    {p.description}
                  </p>
                )}
                <FactsList facts={p.facts ?? []} className="mt-0" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
