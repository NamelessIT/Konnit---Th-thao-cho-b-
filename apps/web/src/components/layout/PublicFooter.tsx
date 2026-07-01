"use client";

import Link from "next/link";
import { useSiteLogo } from "@/hooks/useSiteLogo";

interface PublicFooterProps {
  /** Footer tagline; defaults to the demo's home line. */
  tagline?: string;
}

/** Site footer (demo `.site-footer`): brand mark on the left, tagline on the right. */
export function PublicFooter({
  tagline = "Safety first. Polite always. Friendly and fun for every small step.",
}: PublicFooterProps) {
  const logoUrl = useSiteLogo();
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--konnit-pink-01)]">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col items-start justify-between gap-5 py-[42px] md:flex-row md:items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-[22px] font-black text-(--konnit-ink)"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Konnit" className="h-8 w-auto rounded-full object-contain" />
          ) : (
            <>
              <span className="brand-mark text-[22px]">k</span>
              konnit
            </>
          )}
        </Link>
        <p className="max-w-[560px] text-left font-bold text-[var(--konnit-muted)] md:text-right">
          {tagline}
        </p>
      </div>
    </footer>
  );
}
