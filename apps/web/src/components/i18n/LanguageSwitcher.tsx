"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { FALLBACK_LOCALES } from "@/lib/i18n/config";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

interface PublicLanguage {
  code: string;
  native_name: string | null;
  name: string;
}

// Cache module-level để không fetch lại mỗi lần mount.
let cached: PublicLanguage[] | null = null;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [langs, setLangs] = useState<PublicLanguage[]>(cached ?? []);

  useEffect(() => {
    if (cached) return;
    fetch(`${API_URL}/api/public/languages`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data?.length) {
          cached = json.data;
          setLangs(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const options =
    langs.length > 0 ? langs : FALLBACK_LOCALES.map((c) => ({ code: c, native_name: c.toUpperCase(), name: c }));

  function switchTo(code: string) {
    if (code === locale) return;
    // Thay segment locale đầu tiên trong pathname.
    const parts = pathname.split("/");
    const known = options.map((o) => o.code);
    if (known.includes(parts[1])) parts[1] = code;
    else parts.splice(1, 0, code);
    router.push(parts.join("/") || `/${code}`);
  }

  if (options.length < 2) return null;

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => switchTo(e.target.value)}
      className="min-h-[44px] rounded-2xl border border-white/60 bg-[rgba(255,247,251,0.86)] px-2 text-sm font-black text-[var(--konnit-ink)]"
    >
      {options.map((l) => (
        <option key={l.code} value={l.code}>
          {(l.code ?? l.code).toUpperCase()}
        </option>
      ))}
    </select>
  );
}
