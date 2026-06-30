"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartNavButton } from "@/components/shop/CartNavButton";
import { UserMenu } from "@/components/auth/UserMenu";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About Us" },
  { href: "/services", label: "Our Business" },
  { href: "/community", label: "Our Community" },
  { href: "/store", label: "Konnit Store" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/cua-hang", label: "Vé sự kiện" },
];

export function PublicHeader() {
  const pathname = usePathname();

  const isCmsActive =
    pathname === "/tin-tuc" ||
    pathname.startsWith("/tin-tuc/") ||
    pathname.startsWith("/c/");

  function isActive(href: string) {
    if (href === "/tin-tuc") return isCmsActive;
    return pathname === href;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-20 mx-auto mt-4 w-[min(1180px,calc(100%-32px))]">
      <nav className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[18px] rounded-2xl border border-white/60 bg-[rgba(255,247,251,0.86)] px-3 py-2.5 shadow-[0_12px_34px_rgba(143,47,103,0.12)] backdrop-blur-[18px]">
        {/* Brand */}
        <Link
          href="http://localhost:3000/"
          className="inline-flex min-w-max items-center gap-2.5 text-[22px] font-black tracking-normal text-[var(--konnit-ink)]"
        >
          <span className="inline-grid h-[34px] w-[34px] place-items-center rounded-full bg-[var(--konnit-berry)] text-[22px] leading-none text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.08)]">
            k
          </span>
          konnit
        </Link>

        {/* Nav links */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto text-sm font-extrabold text-[var(--konnit-muted)]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-2xl px-2.5 font-black transition-colors ${
                  active
                    ? "bg-[var(--konnit-pink-02)] text-[var(--konnit-berry)]"
                    : "hover:bg-[var(--konnit-pink-02)] hover:text-[var(--konnit-berry)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        {/* Actions */}
        <div className="flex items-center gap-2">
          <CartNavButton />
          <UserMenu />
          <Link
            href="/legacy/services.html#contact"
            className="btn-shine inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-2xl bg-[var(--konnit-berry)] px-4 font-black text-white"
          >
            Join a Session
          </Link>
        </div>
      </nav>
    </header>
  );
}
