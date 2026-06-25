"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/legacy/index.html", label: "Home" },
  { href: "/legacy/services.html", label: "Our Business" },
  { href: "/legacy/community.html", label: "Our Community" },
  { href: "/legacy/store.html", label: "Konnit Store" },
  { href: "/tin-tuc", label: "Tin tuc" },
];

export function PublicHeader() {
  const pathname = usePathname();

  // The CMS-driven pages (Tin tức list, category & page routes) all map to "Tin tức".
  const isCmsActive =
    pathname === "/tin-tuc" ||
    pathname.startsWith("/tin-tuc/") ||
    pathname.startsWith("/c/");

  function isActive(href: string) {
    if (href === "/tin-tuc") return isCmsActive;
    return pathname === href;
  }

  return (
    <header className="fixed top-0 inset-x-0 z-20 mt-4 mx-auto w-[min(1180px,calc(100%-32px))]">
      <nav className="flex items-center gap-4 rounded-2xl border border-white/60 bg-[var(--konnit-pink-01)]/80 px-4 py-2.5 shadow-[0_12px_34px_rgba(143,47,103,0.12)] backdrop-blur-[18px] transition-shadow duration-300 hover:shadow-[0_16px_44px_rgba(143,47,103,0.18)]">
        <Link
          href="/"
          className="group flex items-center gap-2 font-bold text-lg text-[var(--konnit-berry)] duration-300 "
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--konnit-berry)] text-sm text-white shadow-sm transition-transform duration-500 ">
            K
          </span>
          Konnit
        </Link>

        <div className="flex-1" />

        <ul className="hidden items-center gap-7 text-sm font-medium md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    active
                      ? "rounded-xl bg-[var(--konnit-berry)] px-3.5 py-1.5 font-semibold text-white shadow-sm transition-colors"
                      : "link-underline rounded-full px-3.5 py-1.5 text-[var(--konnit-ink)] transition-colors duration-200 hover:text-[var(--konnit-berry)]"
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/tin-tuc"
          className="btn-shine ml-2 hidden rounded-full bg-[var(--konnit-berry)] px-5 py-2 text-sm font-semibold text-white shadow-md sm:inline-block"
        >
          Khám phá
        </Link>
      </nav>
    </header>
  );
}
