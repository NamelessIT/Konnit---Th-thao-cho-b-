// Cấu hình i18n dùng chung (client + server + proxy).

export const DEFAULT_LOCALE = "vi";

// Fallback tĩnh khi API ngôn ngữ không truy cập được (vd lúc build).
// Ngôn ngữ thêm động qua admin vẫn hoạt động nhờ proxy fetch danh sách active.
export const FALLBACK_LOCALES = ["vi", "en"] as const;

export type Locale = string;

/** Ghép prefix locale vào href nội bộ. Bỏ qua link ngoài / neo / mailto. */
export function localizeHref(locale: string, href: string): string {
  if (!href) return `/${locale}`;
  if (/^([a-z]+:)?\/\//i.test(href) || href.startsWith("#") || href.startsWith("mailto:")) {
    return href;
  }
  if (!href.startsWith("/")) return href; // relative — để nguyên
  // đã có prefix locale rồi (vd /en/... hoặc /vi)
  const seg = href.split("/")[1];
  if (seg && isLocaleLike(seg)) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** Loại bỏ prefix locale khỏi pathname → phần path còn lại (bắt đầu bằng '/'). */
export function stripLocale(pathname: string, locales: readonly string[]): { locale: string | null; rest: string } {
  const parts = pathname.split("/");
  const first = parts[1];
  if (first && locales.includes(first)) {
    const rest = "/" + parts.slice(2).join("/");
    return { locale: first, rest: rest === "/" ? "/" : rest.replace(/\/$/, "") || "/" };
  }
  return { locale: null, rest: pathname };
}

// Mã trông giống locale: 2 chữ cái, có thể kèm -XX
function isLocaleLike(seg: string): boolean {
  return /^[a-z]{2}(-[a-z]{2})?$/i.test(seg);
}
