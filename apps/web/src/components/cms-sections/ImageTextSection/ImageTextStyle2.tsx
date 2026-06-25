import type { SectionProps } from "@konnit/ui";

export function ImageTextStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-16 bg-[var(--konnit-pink-01)]">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-[var(--konnit-berry)]/10">
        <div className="grid items-stretch md:grid-cols-2">
          <div className="rise-in flex flex-col justify-center p-8 md:p-12">
            <div className="mb-4 h-1 w-12 rounded-full bg-[var(--konnit-berry)]" />
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
          {c.image && (
            <div className="rise-in" style={{ animationDelay: "0.1s" }}>
              <img
                src={c.image as string}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
