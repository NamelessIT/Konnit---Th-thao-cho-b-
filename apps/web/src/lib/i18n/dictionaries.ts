import "server-only";

export type Dictionary = Record<string, unknown>;

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Deep-set a dot-path key ("nav.home") into a nested object. */
function setPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

/** Lookup helper for server components — mirrors useT() dot-path resolution. */
export function tFrom(dict: Dictionary): (key: string) => string {
  return (key: string) => {
    const val = key.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
      return undefined;
    }, dict);
    return typeof val === "string" ? val : key;
  };
}

/**
 * Load UI strings từ API (base là VI defaults + overlay DB translations).
 * Nếu API không truy cập được (build time) → trả object rỗng, useT() fallback về key.
 */
export async function getDictionary(locale: string): Promise<Dictionary> {
  try {
    const res = await fetch(`${API}/api/public/ui-strings?locale=${locale}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const flat: Record<string, string> = json?.data ?? {};
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(flat)) {
        if (value) setPath(out, key, value);
      }
      return out;
    }
  } catch {
    // API chưa sẵn sàng (build time, cold start) → trả rỗng
  }
  return {};
}
