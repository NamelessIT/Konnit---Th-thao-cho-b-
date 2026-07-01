"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFetch } from "@/hooks/useCmsData";
import { api, ApiError } from "@/lib/api-client";
import type { PaymentSettings, SmtpSettings, LogoSettings } from "@/lib/shop/types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const MAX_SIZE = 5 * 1024 * 1024;

function mediaUrl(path: string) {
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

// ─── Bank Transfer Section ────────────────────────────────────────────────────

function BankSection() {
  const { data, loading } = useFetch<PaymentSettings>("/admin/settings/payment");
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PaymentSettings>({
    qrImagePath: null,
    accountName: "",
    accountNumber: "",
    bankName: "",
    note: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function update<K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_SIZE) { toast.error("Ảnh vượt quá 5MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE_URL}/api/admin/uploads`, {
        method: "POST", body: fd, credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Tải ảnh thất bại");
      update("qrImagePath", json.data.url as string);
      toast.success("Đã tải ảnh QR lên");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await api.put<PaymentSettings>("/admin/settings/payment", form);
      setForm(saved);
      toast.success("Đã lưu cấu hình chuyển khoản");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Đang tải…</p>;

  return (
    <div className="grid max-w-3xl gap-6 lg:grid-cols-[260px_1fr]">
      <div className="space-y-3">
        <Label>Mã QR ngân hàng</Label>
        <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
          {form.qrImagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(form.qrImagePath)} alt="Mã QR chuyển khoản"
              className="h-full w-full object-contain p-2" />
          ) : (
            <span className="px-4 text-center text-xs text-muted-foreground">Chưa có ảnh QR</span>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading}
            onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UploadCloud className="mr-2 size-4" />}
            Tải ảnh QR
          </Button>
          {form.qrImagePath && (
            <Button type="button" variant="ghost" size="sm" onClick={() => update("qrImagePath", null)}>
              <Trash2 className="mr-1 size-4" />Xoá
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bankName">Ngân hàng</Label>
          <Input id="bankName" value={form.bankName}
            onChange={(e) => update("bankName", e.target.value)}
            placeholder="VD: Vietcombank — CN Tân Bình" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountName">Chủ tài khoản</Label>
          <Input id="accountName" value={form.accountName}
            onChange={(e) => update("accountName", e.target.value)}
            placeholder="VD: CONG TY TNHH KONNIT" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Số tài khoản</Label>
          <Input id="accountNumber" value={form.accountNumber}
            onChange={(e) => update("accountNumber", e.target.value)}
            placeholder="VD: 0123456789" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Ghi chú (hiển thị cho khách)</Label>
          <Textarea id="note" rows={3} value={form.note}
            onChange={(e) => update("note", e.target.value)}
            placeholder="VD: Vui lòng ghi đúng nội dung là mã đơn để được xác nhận nhanh." />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu…" : "Lưu cấu hình"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Logo Section ─────────────────────────────────────────────────────────────

function LogoSection() {
  const { data, loading } = useFetch<LogoSettings>("/admin/settings/logo");
  const inputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setLogoUrl(data.url ?? null);
  }, [data]);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_SIZE) { toast.error("Ảnh vượt quá 5MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE_URL}/api/admin/uploads`, {
        method: "POST", body: fd, credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error?.message ?? "Tải ảnh thất bại");
      const url = json.data.url as string;
      setLogoUrl(url);
      await api.put("/admin/settings/logo", { url });
      toast.success("Đã cập nhật logo");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await api.put("/admin/settings/logo", { url: null });
      setLogoUrl(null);
      toast.success("Đã xoá logo");
    } catch {
      toast.error("Xoá thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Đang tải…</p>;

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="grid h-32 w-full place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(logoUrl)} alt="Logo" className="h-full w-auto max-w-full object-contain p-4" />
        ) : (
          <span className="text-xs text-muted-foreground">Chưa có logo</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={uploading}
          onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <UploadCloud className="mr-2 size-4" />}
          {logoUrl ? "Thay logo" : "Tải logo lên"}
        </Button>
        {logoUrl && (
          <Button type="button" variant="ghost" size="sm" disabled={saving} onClick={handleRemove}>
            <Trash2 className="mr-1 size-4" />Xoá
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        PNG/JPG/SVG, tối đa 5MB. Logo dùng ở header, footer, QR card và email biên nhận.
      </p>
    </div>
  );
}

// ─── SMTP Section ─────────────────────────────────────────────────────────────

const EMPTY_SMTP: SmtpSettings = {
  enabled: false, host: "", port: 587, secure: false,
  user: "", pass: "", fromName: "Konnit", fromEmail: "",
};

function SmtpSection() {
  const { data, loading } = useFetch<SmtpSettings>("/admin/settings/smtp");
  const [form, setForm] = useState<SmtpSettings>(EMPTY_SMTP);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function update<K extends keyof SmtpSettings>(key: K, value: SmtpSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await api.put<SmtpSettings>("/admin/settings/smtp", form);
      setForm(saved);
      toast.success("Đã lưu cấu hình SMTP");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">Đang tải…</p>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Enable toggle */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input
          id="smtpEnabled"
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => update("enabled", e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-(--konnit-berry)"
        />
        <Label htmlFor="smtpEnabled" className="cursor-pointer font-semibold">
          Bật gửi email tự động
        </Label>
        <span className="text-xs text-muted-foreground">
          — Gửi biên nhận sau khi đơn được xác nhận thanh toán
        </span>
      </div>

      <fieldset disabled={!form.enabled} className="space-y-4 disabled:opacity-50">
        {/* Host + Port + Secure */}
        <div className="grid grid-cols-[1fr_100px_auto] items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Server</Label>
            <Input id="smtpHost" value={form.host}
              onChange={(e) => update("host", e.target.value)}
              placeholder="smtp.gmail.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPort">Port</Label>
            <Input id="smtpPort" type="number" value={form.port}
              onChange={(e) => update("port", parseInt(e.target.value, 10) || 587)} />
          </div>
          <div className="flex items-center gap-2 pb-2.5">
            <input id="smtpSecure" type="checkbox" checked={form.secure}
              onChange={(e) => update("secure", e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-(--konnit-berry)" />
            <Label htmlFor="smtpSecure" className="cursor-pointer text-sm">TLS/SSL</Label>
          </div>
        </div>

        {/* User + Pass */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtpUser">Tên đăng nhập</Label>
            <Input id="smtpUser" value={form.user}
              onChange={(e) => update("user", e.target.value)}
              placeholder="user@gmail.com" autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPass">Mật khẩu</Label>
            <Input id="smtpPass" type="password" value={form.pass}
              onChange={(e) => update("pass", e.target.value)}
              placeholder="••••••••" autoComplete="new-password" />
          </div>
        </div>

        {/* From name + email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fromName">Tên người gửi</Label>
            <Input id="fromName" value={form.fromName}
              onChange={(e) => update("fromName", e.target.value)}
              placeholder="Konnit" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">Email người gửi</Label>
            <Input id="fromEmail" type="email" value={form.fromEmail}
              onChange={(e) => update("fromEmail", e.target.value)}
              placeholder="noreply@konnit.vn" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Để trống SMTP Server → dùng Ethereal test inbox (chỉ ghi log URL xem thư, phù hợp dev).
        </p>
      </fieldset>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu cấu hình SMTP"}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentSettingsPage() {
  return (
    <div className="space-y-12">
      <div>
        <PageHeader
          title="Logo thương hiệu"
          description="Logo hiển thị ở header, footer, QR card và email biên nhận"
        />
        <LogoSection />
      </div>

      <div>
        <PageHeader
          title="Cấu hình thanh toán"
          description="Thiết lập thông tin chuyển khoản hiển thị cho khách ở bước thanh toán"
        />
        <BankSection />
      </div>

      <div>
        <PageHeader
          title="Cấu hình Email (SMTP)"
          description="Kết nối máy chủ email để gửi biên nhận tự động sau khi xác nhận đơn"
        />
        <SmtpSection />
      </div>
    </div>
  );
}
