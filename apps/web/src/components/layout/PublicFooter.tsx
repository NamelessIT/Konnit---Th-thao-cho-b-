import Link from "next/link";

interface PublicFooterProps {
  /** Footer tagline; defaults to the demo's home line. */
  tagline?: string;
}

/** Site footer (demo `.site-footer`): brand mark on the left, tagline on the right. */
export function PublicFooter({
  tagline = "Safety first. Polite always. Friendly and fun for every small step.",
}: PublicFooterProps) {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--konnit-pink-01)]">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col items-start justify-between gap-5 py-[42px] md:flex-row md:items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-[22px] font-black text-[var(--konnit-ink)]"
        >
          <span className="brand-mark text-[22px]">k</span>
          konnit
        </Link>
        <p className="max-w-[560px] text-left font-bold text-[var(--konnit-muted)] md:text-right">
          {tagline}
        </p>
      </div>
    </footer>
  );
}
