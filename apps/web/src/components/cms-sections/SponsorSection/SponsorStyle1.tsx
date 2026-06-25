import type { SectionProps } from "@konnit/ui";

export function SponsorStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  const logos = (c.logos as { src?: string; alt?: string }[]) ?? [];
  const displayTitle = (c.title as string) || title;

  return (
    <section className="px-6 py-16 bg-[var(--konnit-pink-01)]">
      <div className="mx-auto max-w-5xl">
        {displayTitle && (
          <div className="mb-10 text-center">
            <span className="inline-block rounded-full bg-[var(--konnit-berry)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--konnit-berry)]">
              {displayTitle}
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {logos.map((logo, i) => (
            <div
              key={i}
              className="group flex h-24 items-center justify-center rounded-2xl border border-[var(--konnit-berry)]/10 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--konnit-berry)]/30 hover:shadow-md"
            >
              {logo.src ? (
                <img
                  src={logo.src}
                  alt={logo.alt ?? ""}
                  className="h-10 max-w-full object-contain opacity-50 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--konnit-muted)] transition-colors group-hover:text-[var(--konnit-berry)]">
                  {logo.alt || `Logo ${i + 1}`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
