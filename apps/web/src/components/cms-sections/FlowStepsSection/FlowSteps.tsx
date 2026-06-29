import type { SectionProps } from "@konnit/ui";
import { Eyebrow } from "../_shared";

interface Item {
  step?: string;
  title?: string;
  description?: string;
}

const COLS: Record<number, string> = {
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
};

/**
 * Numbered step cards (demo `.flow-grid` / `.experience-grid` / `.guide-grid` / `.impact-grid`).
 * Shared base; style variants differ only by column count.
 */
function FlowStepsGrid({ contentJson, title, description, cols }: SectionProps & { cols: number }) {
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

        <div className={`mt-7 grid gap-3.5 ${COLS[cols] ?? COLS[4]}`}>
          {items.map((item, i) => (
            <article
              key={i}
              className="hover-lift rise-in grid content-start gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-white/85 p-[18px] shadow-[var(--shadow-card)]"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--konnit-berry)] text-sm font-extrabold text-white">
                {item.step || String(i + 1).padStart(2, "0")}
              </span>
              {item.title && (
                <h3 className="text-[28px] font-extrabold leading-tight text-[var(--konnit-ink)]">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="text-[17px] font-bold leading-snug text-[var(--konnit-muted)]">
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

export function FlowStepsStyle1(props: SectionProps) {
  return <FlowStepsGrid {...props} cols={3} />;
}
export function FlowStepsStyle2(props: SectionProps) {
  return <FlowStepsGrid {...props} cols={4} />;
}
export function FlowStepsStyle3(props: SectionProps) {
  return <FlowStepsGrid {...props} cols={5} />;
}
