"use client";

import { useEffect, useState } from "react";
import { shopApi } from "@/lib/shop/api";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

function toAbsolute(url: string | null): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

// Module-level cache: fetch 1 lần cho toàn bộ session
let cached: string | null | undefined = undefined;
const listeners = new Set<(url: string | null) => void>();

async function loadLogo() {
  if (cached !== undefined) return;
  const url = toAbsolute(await shopApi.getLogo());
  cached = url;
  listeners.forEach((fn) => fn(url));
  listeners.clear();
}

export function useSiteLogo(): string | null {
  const [logo, setLogo] = useState<string | null>(cached ?? null);

  useEffect(() => {
    if (cached !== undefined) {
      setLogo(cached);
      return;
    }
    listeners.add(setLogo);
    loadLogo();
    return () => { listeners.delete(setLogo); };
  }, []);

  return logo;
}
