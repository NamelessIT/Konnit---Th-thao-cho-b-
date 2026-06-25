import type { SectionProps } from "@konnit/ui";
import { Info } from "lucide-react";

export function NoteAlertStyle1({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-8">
      <div className="rise-in mx-auto flex max-w-3xl gap-4 rounded-2xl border border-[var(--konnit-sky-strong)]/30 bg-[var(--konnit-sky)]/30 p-5 shadow-sm">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--konnit-sky-strong)]/15">
          <Info className="size-5 text-[var(--konnit-sky-strong)]" />
        </span>
        <div className="min-w-0">
          {((c.title as string) || title) && (
            <h3 className="mb-1 font-semibold text-[var(--konnit-ink)]">
              {(c.title as string) || title}
            </h3>
          )}
          {c.content && (
            <div
              className="text-sm text-[var(--konnit-ink)]/80"
              dangerouslySetInnerHTML={{ __html: c.content as string }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
