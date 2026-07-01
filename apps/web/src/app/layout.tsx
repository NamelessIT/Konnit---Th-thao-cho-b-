import type { Metadata } from "next";
import { headers } from "next/headers";
import { Baloo_2, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { AuthGateDialog } from "@/components/auth/AuthGateDialog";
import "./globals.css";

// Rounded, playful display font matching the Konnit demo (ui-rounded / Arial Rounded MT Bold).
// Baloo 2 ships a Vietnamese subset (site is lang="vi") and a 400–800 weight axis.
const baloo = Baloo_2({
  variable: "--font-rounded",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

async function fetchLogoUrl(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/settings/logo`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const url: string | null = json?.data?.url ?? null;
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_URL}${url}`;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const logoUrl = await fetchLogoUrl();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Konnit — Thể thao cho bé",
      template: "%s | Konnit",
    },
    description: "Konnit — Nền tảng thể thao và hoạt động dành cho trẻ em Việt Nam",
    icons: { icon: "/api/favicon" },
    ...(logoUrl && {
      openGraph: { images: [{ url: logoUrl }] },
    }),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale do proxy set qua header (admin/không prefix → mặc định).
  const locale = (await headers()).get("x-locale") ?? DEFAULT_LOCALE;
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${baloo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <AuthGateDialog />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
