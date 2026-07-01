"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  Image as ImageIcon,
  LogOut,
  CalendarDays,
  Ticket,
  BadgePercent,
  ReceiptText,
  QrCode,
  ShieldCheck,
  BarChart3,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useSiteLogo } from "@/hooks/useSiteLogo";

const CMS_MENU = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cms/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/cms/pages", label: "Page Builder", icon: FileText },
  { href: "/admin/cms/uploads", label: "Media", icon: ImageIcon },
];

const SALES_MENU = [
  { href: "/admin/su-kien", label: "Sự kiện", icon: CalendarDays },
  { href: "/admin/loai-ve", label: "Loại vé", icon: Ticket },
  { href: "/admin/vouchers", label: "Voucher/Coupon", icon: BadgePercent },
  { href: "/admin/orders", label: "Đơn hàng", icon: ReceiptText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const canCheckin = user?.role === "admin" || user?.role === "staff";
  const isSuperAdmin = user?.role === "admin";

  const salesMenu = [
    ...SALES_MENU,
    ...(isSuperAdmin
      ? [{ href: "/admin/bao-cao", label: "Báo cáo & Doanh số", icon: BarChart3 }]
      : []),
    ...(canCheckin ? [{ href: "/admin/check-in", label: "Check-in", icon: QrCode }] : []),
  ];

  const logoUrl = useSiteLogo();

  const initials = (user?.fullName || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar className="border-[var(--konnit-pink-03)]">
      <SidebarHeader className="border-b border-[var(--konnit-pink-03)] px-4 py-4">
        <Link href="/admin" className="group flex items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt="Konnit" className="h-9 w-auto rounded-full object-contain" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-(--konnit-berry) font-bold text-white shadow-sm transition-transform duration-500 group-hover:rotate-12">
              K
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span className="font-bold text-(--konnit-berry)">Konnit</span>
            <span className="text-xs text-(--konnit-muted)">Admin CMS</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CMS / Page Builder</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CMS_MENU.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      className="gap-3 data-[active=true]:bg-[var(--konnit-pink-02)] data-[active=true]:font-semibold data-[active=true]:text-[var(--konnit-berry)]"
                    >
                      <Icon className="size-4.5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Bán vé</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesMenu.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      className="gap-3 data-[active=true]:bg-[var(--konnit-pink-02)] data-[active=true]:font-semibold data-[active=true]:text-[var(--konnit-berry)]"
                    >
                      <Icon className="size-4.5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/admin/tai-khoan" />}
                    isActive={pathname.startsWith("/admin/tai-khoan")}
                    className="gap-3 data-[active=true]:bg-[var(--konnit-pink-02)] data-[active=true]:font-semibold data-[active=true]:text-[var(--konnit-berry)]"
                  >
                    <ShieldCheck className="size-4.5" />
                    <span>Tài khoản & Quyền</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/admin/thanh-toan" />}
                    isActive={pathname.startsWith("/admin/thanh-toan")}
                    className="gap-3 data-[active=true]:bg-[var(--konnit-pink-02)] data-[active=true]:font-semibold data-[active=true]:text-[var(--konnit-berry)]"
                  >
                    <Wallet className="size-4.5" />
                    <span>Cấu hình thanh toán</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-[var(--konnit-pink-03)] p-3">
        {user && (
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--konnit-berry)] text-xs font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--konnit-ink)]">
                {user.fullName || user.email}
              </p>
              <p className="truncate text-xs text-[var(--konnit-muted)]">
                {user.role}
              </p>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-3.5" />
              Thoát
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}