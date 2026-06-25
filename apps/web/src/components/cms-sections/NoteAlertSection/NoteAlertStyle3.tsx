import type { SectionProps } from "@konnit/ui";
import { CheckCircle } from "lucide-react";

export function NoteAlertStyle3({ contentJson, title }: SectionProps) {
  const c = contentJson;
  return (
    <section className="px-6 py-8">
      <div className="rise-in mx-auto max-w-3xl rounded-2xl bg-[var(--konnit-mint)]/30 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--konnit-mint-strong)]">
            <CheckCircle className="size-4 text-white" />
          </div>
          {((c.title as string) || title) && (
            <h3 className="font-semibold text-[var(--konnit-mint-strong)]">
              {(c.title as string) || title}
            </h3>
          )}
        </div>
        {c.content && (
          <div
            className="ml-11 text-sm text-[var(--konnit-ink)]/80"
            dangerouslySetInnerHTML={{ __html: c.content as string }}
          />
        )}
      </div>
    </section>
  );
}
