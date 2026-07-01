"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, QrCode } from "lucide-react";
import { useFetch } from "@/hooks/useCmsData";
import { api, ApiError } from "@/lib/api-client";

interface AdminEvent {
  id: number;
  name: string;
}

interface ScanResult {
  kind: "success" | "error";
  title: string;
  detail: string;
  attendee?: string;
  at: string;
}

export default function CheckInPage() {
  const { data: events } = useFetch<AdminEvent[]>("/admin/events");
  const [eventId, setEventId] = useState<number | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);

  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const lastScan = useRef<{ token: string; at: number }>({ token: "", at: 0 });
  const eventIdRef = useRef<number | null>(null);
  eventIdRef.current = eventId;

  async function doCheckin(token: string) {
    const eid = eventIdRef.current;
    if (!eid) {
      toast.error("Vui lòng chọn sự kiện trước");
      return;
    }
    const now = new Date().toLocaleTimeString("vi-VN");
    try {
      const data = await api.post<{ attendee_name: string; ticket_name: string }>(
        "/admin/tickets/checkin",
        { eventId: eid, qrToken: token },
      );
      const r: ScanResult = {
        kind: "success",
        title: "Check-in thành công",
        detail: data.ticket_name,
        attendee: data.attendee_name,
        at: now,
      };
      setResult(r);
      setHistory((h) => [r, ...h].slice(0, 20));
    } catch (e) {
    console.error("[checkin]", e);   // ← xem Console
    const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Lỗi check-in";
    const r: ScanResult = { kind: "error", title: "Không hợp lệ", detail: msg, at: now };
    setResult(r);
    setHistory((h) => [r, ...h].slice(0, 20));
    }
  }

  function onScan(token: string) {
    const now = Date.now();
    // Debounce cùng token trong 1.5s
    if (token === lastScan.current.token && now - lastScan.current.at < 1500) return;
    lastScan.current = { token, at: now };
    doCheckin(token);
  }

  async function onFile(file: File) {
    const { Html5Qrcode } = await import("html5-qrcode");
    const tmp = new Html5Qrcode("qr-file");
    try {
      const decoded = await tmp.scanFile(file, false);
      onScan(decoded);
    } catch {
      toast.error("Không đọc được QR từ ảnh");
    } finally {
      try { await tmp.clear(); } catch {}
    }
  }

    const html5Ref = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

    function startScanner() {
    if (!eventId) {
        toast.error("Chọn sự kiện trước khi bật camera");
        return;
    }
    setScanning(true);
    }

    useEffect(() => {
    if (!scanning) return;
    let active = true;
    (async () => {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!active || !document.getElementById("qr-reader")) return;
        const instance = new Html5Qrcode("qr-reader");
        html5Ref.current = instance as unknown as { stop: () => Promise<void>; clear: () => void };
        const config = { fps: 10, qrbox: 250 };
        try {
        // gọi camera → trình duyệt hỏi quyền
        await instance.start({ facingMode: "environment" }, config, (d: string) => onScan(d), () => {});
        } catch {
        // laptop không có camera "sau" → fallback camera đầu tiên
        try {
            const cams = await Html5Qrcode.getCameras();
            if (cams[0]) await instance.start(cams[0].id, config, (d: string) => onScan(d), () => {});
            else throw new Error("no-camera");
        } catch {
            toast.error("Không mở được camera. Hãy bấm 'Cho phép' khi trình duyệt hỏi, hoặc dùng nhập mã thủ công.");
            setScanning(false);
        }
        }
    })();
    return () => {
        active = false;
        const inst = html5Ref.current;
        if (inst) {
        inst.stop().then(() => inst.clear()).catch(() => {});
        html5Ref.current = null;
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scanning]);

  return (
    <div className="">
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-black text-[var(--konnit-ink)]">
        <QrCode className="size-6" /> Check-in vé
      </h1>
      <p className="mb-6 text-sm text-[var(--konnit-muted)]">
        Chọn sự kiện, quét QR bằng camera hoặc nhập mã vé thủ công.
      </p>

      {/* Event selector */}
      <label className="mb-2 block text-sm font-bold text-[var(--konnit-ink)]">Sự kiện *</label>
      <select
        value={eventId ?? ""}
        onChange={(e) => setEventId(e.target.value ? Number(e.target.value) : null)}
        className="mb-6 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20"
      >
        <option value="">-- Chọn sự kiện --</option>
        {(events ?? []).map((ev) => (
          <option key={ev.id} value={ev.id}>
            {ev.name}
          </option>
        ))}
      </select>

      {/* Result banner */}
      {result && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 ${
            result.kind === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {result.kind === "success" ? (
            <CheckCircle2 className="size-7 shrink-0" />
          ) : (
            <XCircle className="size-7 shrink-0" />
          )}
          <div>
            <p className="font-bold">{result.title}</p>
            <p className="text-sm">
              {result.attendee ? `${result.attendee} · ` : ""}
              {result.detail}
            </p>
          </div>
        </div>
      )}

      {/* Camera */}
      {!scanning ? (
        <button
          onClick={startScanner}
          className="mb-4 w-full rounded-xl bg-[var(--konnit-berry)] py-3 font-bold text-white hover:opacity-90"
        >
          Bật camera quét QR
        </button>
      ) : (
        <div id="qr-reader" className="mx-auto mb-4 w-full max-w-sm overflow-hidden rounded-2xl" />
      )}

      {/* Quét từ ảnh + vùng tạm cho scanFile */}
      <label className="mb-4 block cursor-pointer text-center text-sm font-medium text-[var(--konnit-berry)] underline">
        Hoặc quét QR từ ảnh
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
      <div id="qr-file" className="hidden" />

      {/* Manual fallback */}
      <div className="mb-6 flex gap-2">
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Nhập mã vé thủ công..."
          className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-[var(--konnit-berry)]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && manual.trim()) {
              doCheckin(manual.trim());
              setManual("");
            }
          }}
        />
        <button
          onClick={() => {
            if (manual.trim()) {
              doCheckin(manual.trim());
              setManual("");
            }
          }}
          className="rounded-xl border border-[var(--konnit-berry)] px-4 text-sm font-bold text-[var(--konnit-berry)] hover:bg-[var(--konnit-pink-02)]"
        >
          Xác nhận
        </button>
      </div>

      {/* Scan history (chỉ tham khảo, không phải nguồn sự thật) */}
      {history.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold text-[var(--konnit-muted)]">Lịch sử quét (phiên này)</h2>
          <ul className="space-y-1.5">
            {history.map((h, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  h.kind === "success" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <span className="font-medium">
                  {h.attendee ?? "—"} · {h.detail}
                </span>
                <span className="text-xs text-[var(--konnit-muted)]">{h.at}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}