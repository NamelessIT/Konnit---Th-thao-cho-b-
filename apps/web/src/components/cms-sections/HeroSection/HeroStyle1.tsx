import type { SectionProps } from "@konnit/ui";

export function HeroStyle1({ contentJson, title, description }: SectionProps) {
  const c = contentJson;
  return (
    <section className="relative overflow-hidden bg-[var(--konnit-pink-01)] px-6 py-24">
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[var(--konnit-berry)]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob pointer-events-none absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-[var(--konnit-sky)]/20 blur-3xl"
        style={{ animationDelay: "-5s" }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <h1 className="rise-in text-balance text-4xl font-extrabold leading-tight text-[var(--konnit-berry)] md:text-6xl">
          {(c.title as string) || title || ""}
        </h1>
        {((c.description as string) || description) && (
          <p
            className="rise-in mx-auto mt-5 max-w-2xl text-pretty text-lg text-[var(--konnit-muted)]"
            style={{ animationDelay: "0.12s" }}
          >
            {(c.description as string) || description}
          </p>
        )}
        {c.content && (
          <div
            className="rise-in prose mx-auto mt-6"
            style={{ animationDelay: "0.2s" }}
            dangerouslySetInnerHTML={{ __html: c.content as string }}
          />
        )}
        {c.image && (
          <img
            src={c.image as string}
            alt={(c.title as string) || ""}
            className="rise-in mx-auto mt-10 max-h-96 rounded-2xl object-cover shadow-[0_30px_60px_-20px_rgba(143,47,103,0.4)] ring-1 ring-white/60"
            style={{ animationDelay: "0.28s" }}
          />
        )}
      </div>
    </section>
  );
}
