"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AdminTopbar({ title }: { title?: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-[var(--konnit-pink-03)] bg-[var(--konnit-pink-01)] px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5 bg-[var(--konnit-pink-03)]" />
      {title ? (
        <h1 className="text-sm font-semibold text-[var(--konnit-ink)]">{title}</h1>
      ) : (
        <span className="text-sm font-medium text-[var(--konnit-muted)]">
          Konnit CMS
        </span>
      )}
      <div className="flex-1" />
      <Link
        href="/legacy/index.html"
        target="_blank"
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--konnit-berry)] transition-colors hover:bg-[var(--konnit-pink-02)]"
      >
        Xem website
        <ExternalLink className="size-4" />
      </Link>
    </header>
  );
}
