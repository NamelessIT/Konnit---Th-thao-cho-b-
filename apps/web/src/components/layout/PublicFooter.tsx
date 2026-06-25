import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/legacy/services.html", label: "Bộ môn" },
  { href: "/legacy/community.html", label: "Cộng đồng" },
  { href: "/legacy/store.html", label: "Cửa hàng" },
  { href: "/tin-tuc", label: "Tin tức" },
];

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--konnit-pink-03)] bg-[var(--konnit-pink-01)]">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-sm">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--konnit-berry)] text-sm font-bold text-white">
                K
              </span>
              <span className="text-lg font-bold text-[var(--konnit-berry)]">
                Konnit
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--konnit-muted)]">
              Nền tảng thể thao và hoạt động dành cho trẻ em Việt Nam — vận động
              vui khỏe mỗi ngày.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="link-underline text-[var(--konnit-ink)] transition-colors hover:text-[var(--konnit-berry)]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-[var(--konnit-pink-03)] pt-6 text-center text-sm text-[var(--konnit-muted)]">
          © {new Date().getFullYear()} Konnit — Thể thao cho bé. Made with{" "}
          <span className="text-[var(--konnit-pink-05)]">♥</span> in Vietnam.
        </div>
      </div>
    </footer>
  );
}
