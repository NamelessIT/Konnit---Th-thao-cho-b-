import "server-only";
import { DEFAULT_LOCALE } from "./config";

// Dictionary UI tĩnh. Locale không có file riêng → fallback về mặc định (vi).
const dictionaries: Record<string, () => Promise<Dictionary>> = {
  vi: () => import("@/dictionaries/vi.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = typeof import("@/dictionaries/vi.json");

export function hasDictionary(locale: string): boolean {
  return locale in dictionaries;
}

export async function getDictionary(locale: string): Promise<Dictionary> {
  const load = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  return load();
}
