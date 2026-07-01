"use client";

import { LocaleLink } from "@/components/i18n/LocaleLink";
import { useSiteLogo } from "@/hooks/useSiteLogo";
import { useT } from "@/lib/i18n/LocaleProvider";

/** Site footer (demo `.site-footer`): brand mark on the left, tagline on the right. */
export function PublicFooter() {
  const logoUrl = useSiteLogo();
  const t = useT();
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--konnit-pink-01)]">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col items-start justify-between gap-5 py-[42px] md:flex-row md:items-center">
        <LocaleLink
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
        </LocaleLink>
        <p className="max-w-[560px] text-left font-bold text-[var(--konnit-muted)] md:text-right">
          {t("footer.tagline")}
        </p>
      </div>
    </footer>
  );
}
