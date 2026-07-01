import type { SectionProps } from "@konnit/ui";
import { CmsLink, Eyebrow, Gallery, type GalleryTint } from "../_shared";

type Tint = "bike" | "camp" | "science" | "pink" | "mint" | "sky";

interface Item {
  icon?: string;
  tint?: Tint;
  title?: string;
  description?: string;
  meta?: string;
  linkLabel?: string;
  linkUrl?: string;
  photos?: string[];
}

// Maps activity tint → icon colors + gallery gradient (demo .service-icon.bike/.camp/.science).
const TINT: Record<Tint, { icon: string; bg: string; gallery: GalleryTint }> = {
  bike: { icon: "var(--konnit-berry)", bg: "var(--konnit-pink-02)", gallery: "pink" },
  pink: { icon: "var(--konnit-berry)", bg: "var(--konnit-pink-02)", gallery: "pink" },
  camp: { icon: "var(--konnit-mint-strong)", bg: "var(--konnit-mint)", gallery: "mint" },
  mint: { icon: "var(--konnit-mint-strong)", bg: "var(--konnit-mint)", gallery: "mint" },
  science: { icon: "var(--konnit-sky-strong)", bg: "var(--konnit-sky)", gallery: "sky" },
  sky: { icon: "var(--konnit-sky-strong)", bg: "var(--konnit-sky)", gallery: "sky" },
};

/**
 * Feature grid — rich service card (demo `.service-grid` / `.service-card`).
 * Colored icon + floating photo gallery + meta pill + "learn more" link.
 */
export function FeatureGridStyle4({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const items = (c.items as Item[]) ?? [];
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

        <div className="mt-[30px] grid gap-4 md:grid-cols-3">
          {items.map((item, i) => {
            const t = TINT[item.tint ?? "pink"] ?? TINT.pink;
            return (
              <article
                key={i}
                className="hover-lift rise-in grid content-start gap-3.5 rounded-[var(--radius)] border border-[var(--line)] bg-[linear-gradient(180deg,var(--card),#fffafd)] p-6 shadow-[var(--shadow-card)]"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {item.icon && (
                  <span
                    className="grid h-[58px] w-[58px] place-items-center rounded-full text-[28px] font-extrabold"
                    style={{ color: t.icon, background: t.bg }}
                  >
                    {item.icon}
                  </span>
                )}
                <Gallery
                  caption="Activity photos"
                  tint={t.gallery}
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
                {(item.meta || item.linkLabel) && (
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
                    {item.meta && <span className="pill">{item.meta}</span>}
                    {item.linkLabel && (
                      <CmsLink
                        value={{ label: item.linkLabel, url: item.linkUrl }}
                        className="link-underline w-max font-extrabold text-[var(--konnit-berry)]"
                      >
                        {item.linkLabel}
                      </CmsLink>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
