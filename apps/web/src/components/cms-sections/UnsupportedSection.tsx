import type { SectionProps } from "@konnit/ui";

export function UnsupportedSection({ contentJson }: SectionProps) {
  return (
    <div className="rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-muted-foreground">
      <p>Section không được hỗ trợ</p>
      <pre className="mt-2 text-xs text-left overflow-auto max-h-32">
        {JSON.stringify(contentJson, null, 2)}
      </pre>
    </div>
  );
}
