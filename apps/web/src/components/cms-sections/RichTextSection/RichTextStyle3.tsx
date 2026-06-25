import type { SectionProps } from "@konnit/ui";

export function RichTextStyle3({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="bg-[var(--konnit-pink-02)] px-6 py-16">
      <div className="rise-in mx-auto max-w-3xl">
        {((c.title as string) || title) && (
          <h2 className="mb-5 text-3xl font-bold text-[var(--konnit-berry)]">
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
