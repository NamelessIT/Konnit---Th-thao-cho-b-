import type { SectionProps } from "@konnit/ui";

export function HeroStyle2({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <div className="rise-in">
          <h1 className="text-balance text-3xl font-extrabold leading-tight text-[var(--konnit-ink)] md:text-5xl">
            {(c.title as string) || title || ""}
          </h1>
          {((c.description as string) || description) && (
            <p className="mt-5 text-lg text-[var(--konnit-muted)]">
              {(c.description as string) || description}
            </p>
          )}
          {c.content && (
            <div
              className="prose mt-4"
              dangerouslySetInnerHTML={{ __html: c.content as string }}
            />
          )}
        </div>
        {c.image && (
          <div
            className="rise-in group relative"
            style={{ animationDelay: "0.15s" }}
          >
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-3xl bg-[var(--konnit-berry)]/20 blur-2xl"
            />
            <img
              src={c.image as string}
              alt={(c.title as string) || ""}
              className="w-full rounded-2xl object-cover shadow-[0_30px_60px_-20px_rgba(143,47,103,0.35)] ring-1 ring-white/60 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
