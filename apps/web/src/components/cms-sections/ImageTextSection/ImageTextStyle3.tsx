import type { SectionProps } from "@konnit/ui";

export function ImageTextStyle3({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section
      className="relative overflow-hidden px-6 py-28"
      style={{
        backgroundImage: c.image ? `url(${c.image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="rise-in relative mx-auto max-w-3xl text-center text-white">
        {((c.title as string) || title) && (
          <h2 className="mb-4 text-balance text-4xl font-extrabold drop-shadow-sm">
            {(c.title as string) || title}
          </h2>
        )}
        {c.content && (
          <div
            className="prose prose-invert mx-auto [&_*]:text-white/90"
            dangerouslySetInnerHTML={{ __html: c.content as string }}
          />
        )}
      </div>
    </section>
  );
}
