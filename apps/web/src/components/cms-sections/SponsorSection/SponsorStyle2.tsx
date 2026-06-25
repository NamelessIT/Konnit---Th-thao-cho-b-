import type { SectionProps } from "@konnit/ui";

export function SponsorStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const logos = (c.logos as { src?: string; alt?: string }[]) ?? [];
  const displayTitle = (c.title as string) || title;

  return (
    <section className="overflow-hidden bg-[var(--konnit-berry)] px-6 py-14">
      <div className="mx-auto max-w-5xl text-center">
        {displayTitle && (
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            {displayTitle}
          </h2>
        )}
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max items-center gap-16 animate-[scroll_22s_linear_infinite] hover:[animation-play-state:paused]">
            {[...logos, ...logos, ...logos].map((logo, i) => (
              <div key={i} className="flex h-14 w-28 shrink-0 items-center justify-center rounded-xl bg-white/10 px-4 backdrop-blur-sm transition-colors hover:bg-white/20">
                {logo.src ? (
                  <img
                    src={logo.src}
                    alt={logo.alt ?? ""}
                    className="h-8 max-w-full object-contain brightness-0 invert opacity-70 transition-opacity hover:opacity-100"
                  />
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {logo.alt || `Logo ${i + 1}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
