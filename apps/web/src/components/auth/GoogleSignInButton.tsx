"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth/api";
import { useAuth } from "@/store/auth";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton() {
  const ref = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const router = useRouter();
  const applySession = useAuth((s) => s.applySession);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCredential(resp: { credential: string }) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const me = await authApi.googleLogin(resp.credential);
      applySession(me);
      const returnUrl =
        new URL(window.location.href).searchParams.get("returnUrl") || "/tai-khoan";
      router.replace(returnUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!ready || !window.google || !CLIENT_ID || !ref.current) return;
    window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredential });
    window.google.accounts.id.renderButton(ref.current, {
      theme: "outline",
      size: "large",
      width: 280,
      text: "continue_with",
      shape: "pill",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      {!CLIENT_ID && (
        <p className="text-sm text-red-500">Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
      )}
      <div ref={ref} aria-busy={busy} />
      {busy && <p className="text-sm text-[var(--konnit-muted)]">Đang xác minh…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}