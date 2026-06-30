"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--konnit-pink-01)]">
        <span className="grid h-12 w-12 animate-pulse place-items-center rounded-2xl bg-[var(--konnit-berry)] font-bold text-white">
          K
        </span>
        <span className="h-6 w-6 animate-spin rounded-full border-3 border-[var(--konnit-pink-04)] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col bg-background">
          <AdminTopbar />
          <main className="w-full flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
