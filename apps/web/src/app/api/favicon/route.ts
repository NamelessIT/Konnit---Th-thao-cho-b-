import { NextResponse } from "next/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export async function GET(request: Request) {
  try {
    const settingsRes = await fetch(`${API_URL}/api/public/settings/logo`, {
      next: { revalidate: 300 },
    });
    if (!settingsRes.ok) throw new Error("no settings");
    const json = await settingsRes.json();
    const url: string | null = json?.data?.url ?? null;
    if (!url) throw new Error("no url");

    const absoluteUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
    const imgRes = await fetch(absoluteUrl);
    if (!imgRes.ok) throw new Error("fetch image failed");

    const buffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") ?? "image/png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/favicon.ico", request.url));
  }
}
