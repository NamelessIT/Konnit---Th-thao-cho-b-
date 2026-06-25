import type { SectionProps } from "@konnit/ui";

export function ImageTextStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        {c.image && (
          <div className="rise-in group overflow-hidden rounded-2xl shadow-lg ring-1 ring-[var(--konnit-pink-03)]">
            <img
              src={c.image as string}
              alt=""
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="rise-in" style={{ animationDelay: "0.1s" }}>
          {((c.title as string) || title) && (
            <h2 className="mb-4 text-3xl font-bold text-[var(--konnit-ink)]">
              {(c.title as string) || title}
            </h2>
          )}
          {c.content && (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: c.content as string }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
