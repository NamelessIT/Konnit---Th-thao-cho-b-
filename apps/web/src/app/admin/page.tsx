"use client";

import Link from "next/link";
import {
  FolderTree,
  FileText,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/hooks/useCmsData";
import { useAuth } from "@/hooks/useAuth";
import { CONTENT_STATUS_LABELS_VI, type ContentStatus } from "@konnit/types";

interface Stats {
  categories: { total: number; published: number };
  pages: { total: number; published: number; draft: number };
  media: { total: number };
  recentPages: {
    id: number;
    title: string;
    slug: string;
    status: string;
    updated_at: string;
    category_name: string | null;
    category_slug: string | null;
  }[];
}

const STAT_CARDS: {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  sub: (s: Stats) => string;
  value: (s: Stats) => number;
}[] = [
  {
    key: "categories",
    label: "Danh mục",
    icon: FolderTree,
    href: "/admin/cms/categories",
    sub: (s) => `${s.categories.published} đã xuất bản`,
    value: (s) => s.categories.total,
  },
  {
    key: "pages",
    label: "Trang",
    icon: FileText,
    href: "/admin/cms/pages",
    sub: (s) => `${s.pages.published} xuất bản · ${s.pages.draft} nháp`,
    value: (s) => s.pages.total,
  },
  {
    key: "media",
    label: "Media",
    icon: ImageIcon,
    href: "/admin/cms/uploads",
    sub: () => "tệp đã tải lên",
    value: (s) => s.media.total,
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, loading } = useFetch<Stats>("/admin/cms/stats");

  return (
    <div className="space-y-8">
      {/* Greeting hero */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--konnit-pink-01)] p-8">
        <div
          aria-hidden
          className="animate-blob pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--konnit-pink-04)]/40 blur-3xl"
        />
        <div className="relative">
          <p className="text-sm font-medium text-[var(--konnit-muted)]">
            Bảng điều khiển CMS
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[var(--konnit-ink)]">
            Chào{user?.fullName ? `, ${user.fullName}` : " mừng trở lại"} 👋
          </h1>
          <p className="mt-2 max-w-lg text-[var(--konnit-muted)]">
            Quản lý danh mục, trang nội dung và thư viện media của Konnit từ một
            nơi duy nhất.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              className="btn-shine bg-[var(--konnit-berry)] text-white"
              render={<Link href="/admin/cms/pages/new" />}
            >
              <Plus className="size-4" /> Tạo trang mới
            </Button>
            <Button
              variant="outline"
              render={<Link href="/admin/cms/categories/new" />}
            >
              <Plus className="size-4" /> Tạo danh mục
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
          <Link key={card.key} href={card.href} className="group block">
            <Card className="hover-lift overflow-hidden border-[var(--konnit-pink-03)]">
              <CardContent className="flex items-center gap-4 p-6">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--konnit-berry)] text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
                >
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--konnit-muted)]">
                    {card.label}
                  </p>
                  {loading || !stats ? (
                    <Skeleton className="mt-1 h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-extrabold text-[var(--konnit-ink)]">
                      {card.value(stats)}
                    </p>
                  )}
                  {stats && (
                    <p className="mt-0.5 text-xs text-[var(--konnit-muted)]">
                      {card.sub(stats)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </div>

      {/* Recent pages */}
      <Card className="border-[var(--konnit-pink-03)]">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--konnit-ink)]">
              Trang cập nhật gần đây
            </h2>
            <Button variant="ghost" size="sm" render={<Link href="/admin/cms/pages" />}>
              Xem tất cả <ArrowRight className="size-3.5" />
            </Button>
          </div>

          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}

          {!loading && stats && stats.recentPages.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--konnit-muted)]">
              Chưa có trang nào. Hãy tạo trang đầu tiên!
            </p>
          )}

          {!loading && stats && stats.recentPages.length > 0 && (
            <ul className="divide-y divide-[var(--konnit-pink-03)]">
              {stats.recentPages.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/cms/pages/${p.id}/builder`}
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-[var(--konnit-pink-01)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[var(--konnit-ink)]">
                        {p.title}
                      </p>
                      <p className="truncate text-xs text-[var(--konnit-muted)]">
                        {p.category_name ?? "—"} ·{" "}
                        {new Date(p.updated_at).toLocaleDateString("vi")}
                      </p>
                    </div>
                    <Badge
                      variant={p.status === "published" ? "default" : "secondary"}
                    >
                      {CONTENT_STATUS_LABELS_VI[p.status as ContentStatus] ?? "Nháp"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
