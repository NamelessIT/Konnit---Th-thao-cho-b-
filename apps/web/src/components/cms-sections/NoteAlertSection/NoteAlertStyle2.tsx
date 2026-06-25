import type { SectionProps } from "@konnit/ui";
import { AlertTriangle } from "lucide-react";

export function NoteAlertStyle2({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-8">
      <div className="rise-in mx-auto max-w-3xl overflow-hidden rounded-2xl border-l-4 border-[var(--konnit-sun-strong)] bg-[var(--konnit-sun)]/25 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--konnit-sun-strong)]" />
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
      </div>
    </section>
  );
}
