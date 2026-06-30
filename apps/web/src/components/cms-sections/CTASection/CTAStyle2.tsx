import type { SectionProps } from "@konnit/ui";
import { CmsLink } from "../_shared";

export function CTAStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-16">
      <div className="rise-in relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-[var(--konnit-berry)] p-12 text-center text-white shadow-[0_30px_60px_-20px_rgba(143,47,103,0.5)]">
        <div
          aria-hidden
          className="animate-blob pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15 blur-2xl"
        />
        <div className="relative">
          {((c.title as string) || title) && (
            <h2 className="text-3xl font-bold">{(c.title as string) || title}</h2>
          )}
          {c.description && (
            <p className="mx-auto mt-3 max-w-md opacity-90">
              {c.description as string}
            </p>
          )}
          {c.buttonLabel && (
            <CmsLink
              value={{ label: c.buttonLabel, url: c.buttonUrl }}
              className="btn-shine mt-7 inline-block rounded-full bg-white px-8 py-3.5 font-semibold text-[var(--konnit-berry)] shadow-lg"
            >
              {c.buttonLabel as string}
            </CmsLink>
          )}
        </div>
      </div>
    </section>
  );
}
