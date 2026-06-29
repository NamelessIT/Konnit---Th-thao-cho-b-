import { cn } from "@/lib/utils";

export interface Fact {
  label?: string;
  value?: string;
}

interface FactsListProps {
  facts: Fact[];
  className?: string;
}

/**
 * Definition-list of label/value pairs (demo `.detail-list` / `.kit-facts`).
 * Used by program cards and product/kit cards.
 */
export function FactsList({ facts, className }: FactsListProps) {
  const rows = facts.filter((f) => f.label || f.value);
  if (rows.length === 0) return null;
  return (
    <dl className={cn("mt-auto grid gap-2.5", className)}>
      {rows.map((f, i) => (
        <div
          key={i}
          className="grid gap-1 border-t border-[var(--line)] pt-2.5"
        >
          {f.label && (
            <dt className="text-xs font-extrabold uppercase leading-tight text-[var(--konnit-berry)]">
              {f.label}
            </dt>
          )}
          {f.value && (
            <dd className="text-[15px] font-bold leading-snug text-[var(--konnit-muted)]">
              {f.value}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
