import type { SectionProps } from "@konnit/ui";

export function CTAStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-20 text-center">
      <div className="rise-in mx-auto max-w-xl">
        {((c.title as string) || title) && (
          <h2 className="text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        {c.description && (
          <p className="mt-3 text-[var(--konnit-muted)]">
            {c.description as string}
          </p>
        )}
        {c.buttonLabel && (
          <a
            href={(c.buttonUrl as string) ?? "#"}
            className="btn-shine mt-7 inline-block rounded-full bg-[var(--konnit-berry)] px-8 py-3.5 font-semibold text-white shadow-lg"
          >
            {c.buttonLabel as string}
          </a>
        )}
      </div>
    </section>
  );
}
