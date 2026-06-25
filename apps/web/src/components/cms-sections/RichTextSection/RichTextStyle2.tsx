import type { SectionProps } from "@konnit/ui";

export function RichTextStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-16">
      <div className="rise-in mx-auto max-w-3xl rounded-2xl border border-[var(--konnit-pink-03)] bg-card p-9 shadow-sm transition-shadow duration-300 hover:shadow-md">
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
      </div>
    </section>
  );
}
