"use client";

import { useEffect, useRef } from "react";

/** Sinh QR quét được từ `data` (link/SĐT/zalo…). Màu berry cho khớp contact card. */
export function ContactQr({ data, alt }: { data: string; alt?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const QRCodeStyling = (await import("qr-code-styling")).default;
      if (cancelled || !ref.current) return;
      ref.current.innerHTML = "";
      const qr = new QRCodeStyling({
        width: 88,
        height: 88,
        data,
        margin: 0,
        qrOptions: { errorCorrectionLevel: "M" },
        dotsOptions: { color: "#8f2f67", type: "rounded" },
        backgroundOptions: { color: "transparent" },
      });
      qr.append(ref.current);
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  return <div ref={ref} aria-label={alt ?? "QR"} className="grid h-full w-full place-items-center" />;
}