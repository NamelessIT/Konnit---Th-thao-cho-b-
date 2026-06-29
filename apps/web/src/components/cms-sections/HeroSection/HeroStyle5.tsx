import type { SectionProps } from "@konnit/ui";
import { Eyebrow } from "../_shared";

interface Cta {
  label?: string;
  url?: string;
}
interface BoardItem {
  icon?: string;
  tint?: "bike" | "camp" | "science" | "berry";
  title?: string;
  subtitle?: string;
}

const ICON_TINT: Record<string, { color: string; bg: string }> = {
  bike: { color: "var(--konnit-berry)", bg: "var(--konnit-pink-02)" },
  camp: { color: "var(--konnit-mint-strong)", bg: "var(--konnit-mint)" },
  science: { color: "var(--konnit-sky-strong)", bg: "var(--konnit-sky)" },
  berry: { color: "#fff", bg: "var(--konnit-berry)" },
};

// Floating card positions matching the demo `.rhythm-bike/.rhythm-camp/.rhythm-science`.
const CARD_POS = [
  { top: 44, left: 32 },
  { top: 190, right: 32 },
  { left: 78, bottom: 44 },
] as const;

/**
 * Hero — split board (demo `.services-hero` / `.store-hero` / `.community-hero`).
 * Left: eyebrow + heading + copy + CTAs. Right: gradient board with 3 floating cards.
 */
export function HeroStyle5({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  const heading = (c.title as string) || title || "";
  const copy = (c.description as string) || description || "";
  const primary = c.primaryCta as Cta | undefined;
  const secondary = c.secondaryCta as Cta | undefined;
  const items = ((c.items as BoardItem[]) ?? []).slice(0, 3);

  return (
    <section className="px-4">
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-[34px] py-14 md:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)]">
        {/* Copy */}
        <div className="grid gap-5">
          {c.eyebrow && <Eyebrow className="rise-in">{c.eyebrow as string}</Eyebrow>}
          <h1 className="rise-in max-w-[690px] text-balance text-[clamp(38px,6vw,68px)] font-extrabold leading-[0.98] text-[var(--konnit-ink)]">
            {heading}
          </h1>
          {copy && (
            <p
              className="rise-in max-w-[620px] text-[clamp(17px,2vw,21px)] font-bold leading-snug text-[var(--konnit-muted)]"
              style={{ animationDelay: "0.1s" }}
            >
              {copy}
            </p>
          )}
          {(primary?.label || secondary?.label) && (
            <div className="flex flex-wrap gap-3 pt-1.5">
              {primary?.label && (
                <a
                  href={primary.url || "#"}
                  className="btn-shine inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-[var(--radius)] bg-[var(--konnit-berry)] px-5 font-extrabold text-white shadow-[0_12px_24px_rgba(143,47,103,0.2)]"
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

        {/* Board with floating cards */}
        <div
          className="relative min-h-[460px] overflow-hidden rounded-[var(--radius)] border border-[var(--line)] shadow-[var(--shadow-panel)] sm:min-h-[520px]"
          style={{
            background:
              "radial-gradient(circle at 24% 18%, rgba(255,230,138,0.78), transparent 24%), radial-gradient(circle at 88% 78%, rgba(191,244,223,0.7), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,233,244,0.82))",
          }}
        >
          {items.map((item, i) => {
            const t = ICON_TINT[item.tint ?? "bike"] ?? ICON_TINT.bike;
            return (
              <div
                key={i}
                className="absolute grid w-[min(250px,66%)] gap-2 rounded-[var(--radius)] border-[3px] border-white/90 bg-white/90 p-[18px] shadow-[var(--shadow-float)]"
                style={CARD_POS[i]}
              >
                {item.icon && (
                  <span
                    className="grid h-[44px] w-[44px] place-items-center rounded-full text-xl font-extrabold"
                    style={{ color: t.color, background: t.bg }}
                  >
                    {item.icon}
                  </span>
                )}
                {item.title && (
                  <strong className="text-[26px] font-extrabold leading-tight text-[var(--konnit-ink)]">
                    {item.title}
                  </strong>
                )}
                {item.subtitle && (
                  <span className="text-sm font-extrabold leading-snug text-[var(--konnit-muted)]">
                    {item.subtitle}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
