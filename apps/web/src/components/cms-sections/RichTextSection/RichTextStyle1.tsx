import type { SectionProps } from "@konnit/ui";

export function RichTextStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-16">
      <div className="rise-in mx-auto max-w-3xl">
        {((c.title as string) || title) && (
          <h2 className="mb-5 text-3xl font-bold text-[var(--konnit-ink)]">
            {(c.title as string) || title}
          </h2>
        )}
        {c.content && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: c.content as string }}
          />
        )}
        {c.note && (
          <p className="mt-5 border-l-2 border-[var(--konnit-pink-04)] pl-4 text-sm italic text-[var(--konnit-muted)]">
            {c.note as string}
          </p>
        )}
      </div>
    </section>
  );
}
