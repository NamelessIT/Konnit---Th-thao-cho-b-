"use client";

import { createContext, useContext, useCallback } from "react";
import { localizeHref, DEFAULT_LOCALE } from "./config";

type Dict = Record<string, unknown>;

interface LocaleContextValue {
  locale: string;
  dict: Dict;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  dict: {},
});

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: string;
  dict: Dict;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): string {
  return useContext(LocaleContext).locale;
}

/** Ghép prefix locale hiện tại vào href nội bộ. */
export function useLocalizedHref(): (href: string) => string {
  const { locale } = useContext(LocaleContext);
  return useCallback((href: string) => localizeHref(locale, href), [locale]);
}

/** t("nav.home") — resolve dot-path trong dictionary, fallback về chính key nếu thiếu. */
export function useT(): (key: string) => string {
  const { dict } = useContext(LocaleContext);
  return useCallback(
    (key: string) => {
      const val = key.split(".").reduce<unknown>((acc, part) => {
        if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
        return undefined;
      }, dict);
      return typeof val === "string" ? val : key;
    },
    [dict],
  );
}
