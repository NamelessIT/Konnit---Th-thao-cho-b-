"use client";

import { useEffect, useRef } from "react";
import { useSiteLogo } from "@/hooks/useSiteLogo";
import { useT } from "@/lib/i18n/LocaleProvider";

interface Props {
  token: string | null;
  attendeeName: string;
  ticketName: string;
  eventName: string;
  isUsed: boolean;
  checkedInAt: string | null;
}

// Trả về src nếu ảnh tồn tại & load được, ngược lại null.
function probeImage(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function QrTicketCard({ token, attendeeName, ticketName, eventName, isUsed, checkedInAt }: Props) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const siteLogoUrl = useSiteLogo();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token || !ref.current) return;

      // DB logo → fallback về /qr-logo.png
      const [{ default: QRCodeStyling }, logo] = await Promise.all([
        import("qr-code-styling"),
        siteLogoUrl ? Promise.resolve(siteLogoUrl) : probeImage("/qr-logo.png"),
      ]);
      if (cancelled || !ref.current) return;

      ref.current.innerHTML = "";
      const qr = new QRCodeStyling({
        width: 200,
        height: 200,
        data: token,
        margin: 1,
        qrOptions: { errorCorrectionLevel: "Q" },
        dotsOptions: { color: "#000000", type: "dots" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { color: "#000000", type: "extra-rounded" },
        cornersDotOptions: { color: "#000000", type: "extra-rounded" },
        // Chỉ gắn logo khi /qr-logo.png thực sự tồn tại
        ...(logo
          ? {
              image: logo,
              imageOptions: {
                crossOrigin: "anonymous",
                margin: 1,
                imageSize: 0.4,
                hideBackgroundDots: true,
              },
            }
          : {}),
      });
      qr.append(ref.current);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, siteLogoUrl]);

  return (
    <div
      className={`rounded-2xl border p-5 text-center transition ${
        isUsed ? "border-slate-200 bg-slate-50 opacity-70" : "border-[var(--konnit-pink-03)] bg-white"
      }`}
    >
      {token ? (
        <div ref={ref} className="mx-auto mb-3 grid h-[200px] w-[200px] place-items-center" />
      ) : (
        <div className="mx-auto mb-3 grid h-[200px] w-[200px] place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">
          {t("qr.noTicket")}
        </div>
      )}
      {token && (
        <p
          className="mb-2 cursor-pointer select-all break-all font-mono text-[11px] text-[var(--konnit-muted)]"
          title={t("qr.manualCheckin")}
        >
          {token}
        </p>
      )}
      <p className="font-bold text-[var(--konnit-ink)]">{attendeeName}</p>
      <p className="text-sm text-[var(--konnit-muted)]">
        {ticketName} · {eventName}
      </p>
      <p className={`mt-2 text-xs font-bold ${isUsed ? "text-slate-500" : "text-green-600"}`}>
        {isUsed
          ? (checkedInAt ? t("qr.usedAt").replace("{time}", new Date(checkedInAt).toLocaleString("vi")) : t("qr.used"))
          : t("qr.unused")}
      </p>
    </div>
  );
}