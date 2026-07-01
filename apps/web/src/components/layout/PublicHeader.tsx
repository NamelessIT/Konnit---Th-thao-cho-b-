"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { CartNavButton } from "@/components/shop/CartNavButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useSiteLogo } from "@/hooks/useSiteLogo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About Us" },
  { href: "/services", label: "Our Business" },
  { href: "/community", label: "Our Community" },
  { href: "/store", label: "Konnit Store" },
  { href: "/tin-tuc", label: "News" },
  // { href: "/cua-hang", label: "Event Tickets" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const logoUrl = useSiteLogo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <nav className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-white/60 bg-[rgba(255,247,251,0.86)] px-3 py-2.5 shadow-[0_12px_34px_rgba(143,47,103,0.12)] backdrop-blur-[18px] lg:gap-[18px]">
        {/* Brand */}
        <Link
          href="/"
          className="inline-flex min-w-max items-center gap-2.5 text-[22px] font-black tracking-normal text-[var(--konnit-ink)]"
        >
          {logoUrl ? (
            // CMS logo URLs may be external and are not limited to Next Image hosts.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Konnit" className="h-8.5 rounded-full w-auto object-contain" />
          ) : (
            <>
              <span className="inline-grid h-8.5 w-8.5 place-items-center rounded-full bg-(--konnit-berry) text-[22px] leading-none text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.08)]">
                k
              </span>
              {/* Wordmark is hidden on mobile to keep the bar compact. */}
              <span className="hidden lg:inline">konnit</span>
            </>
          )}
        </Link>

        {/* Nav links (desktop only) */}
        <div className="hidden items-center justify-center gap-1.5 overflow-x-auto text-sm font-extrabold text-[var(--konnit-muted)] lg:flex">
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

        {/* Actions */}
        <div className="flex items-center justify-self-end gap-2">
          <CartNavButton />

          {/* Account menu — desktop bar only; on mobile it lives inside the sheet. */}
          <div className="hidden lg:block">
            <UserMenu />
          </div>

          {/* Primary CTA — always visible on every breakpoint. */}
          <Link
            href="/cua-hang"
            className="btn-shine inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-2xl bg-[var(--konnit-berry)] px-3 text-sm font-black text-white lg:px-4"
          >
            Join an Event
          </Link>

          {/* Hamburger — mobile only. */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Mở menu điều hướng"
                  className="text-[var(--konnit-ink)] lg:hidden"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent className="w-[min(88vw,360px)] bg-[#fff9fc]">
              <SheetHeader className="border-b border-[var(--konnit-pink-02)] px-5 py-5">
                <SheetTitle className="text-lg font-black text-[var(--konnit-ink)]">
                  Konnit
                </SheetTitle>
                <SheetDescription>Chọn trang bạn muốn xem</SheetDescription>
              </SheetHeader>

              {/* Account (moved in from the top bar to save space on mobile). */}
              <div className="flex items-center justify-between gap-3 border-b border-[var(--konnit-pink-02)] px-5 py-4">
                <span className="text-sm font-bold text-[var(--konnit-muted)]">Tài khoản</span>
                <UserMenu />
              </div>

              <div className="flex flex-col gap-1 px-3 py-2">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center rounded-lg px-3 text-base font-bold transition-colors",
                      isActive(item.href)
                        ? "bg-[var(--konnit-pink-02)] text-[var(--konnit-berry)]"
                        : "text-[var(--konnit-ink)] hover:bg-[var(--konnit-pink-02)]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto border-t border-[var(--konnit-pink-02)] p-4">
                <Button
                  render={
                    <Link href="/cua-hang" onClick={() => setMobileMenuOpen(false)} />
                  }
                  className="h-11 w-full bg-[var(--konnit-berry)] font-black hover:bg-[var(--konnit-berry)]/90"
                >
                  Join an Event
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
