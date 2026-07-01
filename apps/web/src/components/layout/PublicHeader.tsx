"use client";

import { usePathname } from "next/navigation";
import { LocaleLink } from "@/components/i18n/LocaleLink";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { CartNavButton } from "@/components/shop/CartNavButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useSiteLogo } from "@/hooks/useSiteLogo";
import { useLocale, useT } from "@/lib/i18n/LocaleProvider";
import { stripLocale } from "@/lib/i18n/config";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/#about", labelKey: "nav.about" },
  { href: "/services", labelKey: "nav.business" },
  { href: "/community", labelKey: "nav.community" },
  { href: "/store", labelKey: "nav.store" },
  { href: "/tin-tuc", labelKey: "nav.news" },
  { href: "/cua-hang", labelKey: "nav.tickets" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const logoUrl = useSiteLogo();
  const locale = useLocale();
  const t = useT();

  // So khớp active dựa trên path đã bỏ prefix locale.
  const { rest } = stripLocale(pathname, [locale]);
  const isCmsActive =
    rest === "/tin-tuc" || rest.startsWith("/tin-tuc/") || rest.startsWith("/c/");

  function isActive(href: string) {
    if (href === "/tin-tuc") return isCmsActive;
    return rest === href;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 mx-auto mt-4 w-[min(1180px,calc(100%-32px))]">
      <nav className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[18px] rounded-2xl border border-white/60 bg-[rgba(255,247,251,0.86)] px-3 py-2.5 shadow-[0_12px_34px_rgba(143,47,103,0.12)] backdrop-blur-[18px]">
        {/* Brand */}
        <LocaleLink
          href="/"
          className="inline-flex min-w-max items-center gap-2.5 text-[22px] font-black tracking-normal text-[var(--konnit-ink)]"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Konnit" className="h-8.5 rounded-full w-auto object-contain" />
          ) : (
            <>
              <span className="inline-grid h-8.5 w-8.5 place-items-center rounded-full bg-(--konnit-berry) text-[22px] leading-none text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.08)]">
                k
              </span>
              konnit
            </>
          )}
        </LocaleLink>

        {/* Nav links */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto text-sm font-extrabold text-[var(--konnit-muted)]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <LocaleLink
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-2xl px-2.5 font-black transition-colors ${
                  active
                    ? "bg-[var(--konnit-pink-02)] text-[var(--konnit-berry)]"
                    : "hover:bg-[var(--konnit-pink-02)] hover:text-[var(--konnit-berry)]"
                }`}
              >
                {t(item.labelKey)}
              </LocaleLink>
            );
          })}
        </div>

        {/* CTA */}
        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <CartNavButton />
          <UserMenu />
          <LocaleLink
            href="/services"
            className="btn-shine inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-2xl bg-[var(--konnit-berry)] px-4 font-black text-white"
          >
            {t("nav.join")}
          </LocaleLink>
        </div>
      </nav>
    </header>
  );
}
