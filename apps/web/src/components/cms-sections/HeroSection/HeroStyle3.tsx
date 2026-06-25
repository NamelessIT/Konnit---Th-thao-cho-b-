import type { SectionProps } from "@konnit/ui";

export function HeroStyle3({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  return (
    <section className="relative min-h-[50vh] bg-[var(--konnit-berry)] px-6 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center text-center">
        <span className="rise-in mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Konnit
        </span>
        <h1 className="rise-in text-balance text-4xl font-extrabold leading-tight md:text-6xl" style={{ animationDelay: "0.08s" }}>
          {(c.title as string) || title || ""}
        </h1>
        {((c.description as string) || description) && (
          <p
            className="rise-in mt-5 max-w-xl text-lg text-white/70"
            style={{ animationDelay: "0.16s" }}
          >
            {(c.description as string) || description}
          </p>
        )}
      </div>
    </section>
  );
}
