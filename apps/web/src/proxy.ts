import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, FALLBACK_LOCALES } from "@/lib/i18n/config";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

// Cache danh sách locale đang bật ở cấp module (tồn tại giữa các request trong 1 runtime).
let cache: { codes: string[]; defaultCode: string; expiresAt: number } | null = null;
const TTL_MS = 60_000;

async function getLocales(): Promise<{ codes: string[]; defaultCode: string }> {
  if (cache && cache.expiresAt > Date.now()) return cache;
  try {
    const res = await fetch(`${API_URL}/api/public/languages`, {
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const json = await res.json();
      const list = (json?.data ?? []) as Array<{ code: string; is_default: boolean }>;
      if (list.length > 0) {
        const codes = list.map((l) => l.code);
        const defaultCode = list.find((l) => l.is_default)?.code ?? codes[0];
        cache = { codes, defaultCode, expiresAt: Date.now() + TTL_MS };
        return cache;
      }
    }
  } catch {
    // API down (vd lúc build) → dùng fallback tĩnh.
  }
  return { codes: [...FALLBACK_LOCALES], defaultCode: DEFAULT_LOCALE };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { codes, defaultCode } = await getLocales();

  const firstSeg = pathname.split("/")[1];
  const hasLocale = codes.includes(firstSeg);

  if (hasLocale) {
    // Truyền locale xuống server components qua header để root layout đọc <html lang>.
    const headers = new Headers(request.headers);
    headers.set("x-locale", firstSeg);
    return NextResponse.next({ request: { headers } });
  }

  // Chưa có prefix → redirect sang locale mặc định, giữ nguyên path + query.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultCode}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Bỏ qua: _next, api, admin (không đa ngôn ngữ), và mọi file có phần mở rộng
  // (favicon.ico, robots.txt, sitemap.xml, ảnh...).
  matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};
