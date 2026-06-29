import type { SectionProps } from "@konnit/ui";
import { Eyebrow } from "../_shared";

interface Cta {
  label?: string;
  url?: string;
}

/**
 * Hero — image-overlay (demo `.hero`).
 * Full-bleed background image + soft pink gradient overlay, left-aligned copy + 2 CTAs.
 */
export function HeroStyle4({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const heading = (c.title as string) || title || "";
  const copy = (c.description as string) || description || "";
  const eyebrow = c.eyebrow as string | undefined;
  const image = c.image as string | undefined;
  const primary = c.primaryCta as Cta | undefined;
  const secondary = c.secondaryCta as Cta | undefined;

  return (
    <section className="relative grid min-h-[78svh] items-center overflow-hidden border-b border-[var(--line)] px-4 pb-16 pt-[150px] md:py-[112px]">
      {/* Background image */}
      <div
        aria-hidden
        className="absolute inset-0 scale-[1.01] bg-[var(--konnit-pink-02)] bg-cover bg-[center_right]"
        style={image ? { backgroundImage: `url("${image}")` } : undefined}
      />
      {/* Soft pink gradient overlay (matches demo two-layer gradient) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,247,251,0.96) 0%, rgba(255,247,251,0.88) 34%, rgba(255,247,251,0.42) 66%, rgba(255,247,251,0.16) 100%), linear-gradient(0deg, rgba(255,247,251,0.95) 0%, rgba(255,247,251,0.2) 34%, rgba(255,247,251,0) 100%)",
        }}
      />

      <div className="relative z-[1] mx-auto grid w-full max-w-[1180px] content-center gap-5">
        {eyebrow && <Eyebrow className="rise-in">{eyebrow}</Eyebrow>}
        <h1 className="rise-in max-w-[690px] text-balance text-[clamp(42px,7vw,82px)] font-extrabold leading-[0.96] text-[var(--konnit-ink)]">
          {heading}
        </h1>
        {copy && (
          <p
            className="rise-in max-w-[620px] text-pretty text-[clamp(18px,2.2vw,23px)] font-bold leading-snug text-[var(--konnit-muted)]"
            style={{ animationDelay: "0.1s" }}
          >
            {copy}
          </p>
        )}
        {(primary?.label || secondary?.label) && (
          <div
            className="rise-in flex flex-wrap gap-3 pt-1.5"
            style={{ animationDelay: "0.18s" }}
          >
            {primary?.label && (
              <a
                href={primary.url || "#"}
                className="btn-shine inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-[var(--radius)] border-2 border-transparent bg-[var(--konnit-berry)] px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
              >
                {primary.label}
              </a>
            )}
            {secondary?.label && (
              <a
                href={secondary.url || "#"}
                className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-[var(--radius)] border-2 border-[var(--line)] bg-white/80 px-5 font-extrabold text-[var(--konnit-berry)] transition-transform hover:-translate-y-0.5"
              >
                {secondary.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
