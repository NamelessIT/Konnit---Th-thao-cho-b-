import type { Metadata } from "next";
import { Baloo_2, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Konnit — Thể thao cho bé",
    template: "%s | Konnit",
  },
  description:
    "Konnit — Nền tảng thể thao và hoạt động dành cho trẻ em Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${baloo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
