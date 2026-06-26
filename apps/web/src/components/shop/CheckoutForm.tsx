"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useMemo, useState } from "react";
import { Plus, Minus, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { useBuyerStore } from "@/store/buyer";
import { useHasMounted } from "@/hooks/useHasMounted";
import { formatVND } from "@/lib/shop/format";
import { shopApi } from "@/lib/shop/api";
import { Button } from "@/components/ui/button";
import { PaymentMethodPicker, type PaymentMethod } from "@/components/shop/PaymentMethodPicker";
import Link from "next/link";
import type { VoucherPreview } from "@/lib/shop/types";

interface ChildFormData {
  ticketTypeId: number;
  attendeeName: string;
  attendeeDob: string;
  attendeeGender: string;
  shirtSize: string;
  medalName: string;
  healthNotes: string;
}

interface CheckoutFormData {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  children: ChildFormData[];
  agreed: boolean;
}

const SHIRT_SIZES = ["2T", "4T", "6T", "8T", "10T", "12T"];

function emptyChild(ticketTypeId: number): ChildFormData {
  return { ticketTypeId, attendeeName: "", attendeeDob: "", attendeeGender: "", shirtSize: "", medalName: "", healthNotes: "" };
}

export function CheckoutForm() {
  const hasMounted = useHasMounted();
  const router = useRouter();
  const { items } = useCartStore();
  const { buyer, setBuyer } = useBuyerStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr");
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<VoucherPreview | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const selectedItems = items.filter((i) => i.selected);

  // Price map: ticketTypeId → unitPrice + name
  const priceMap = useMemo(() => {
    const m = new Map<number, { name: string; unitPrice: number }>();
    selectedItems.forEach((i) => m.set(i.ticketTypeId, { name: i.name, unitPrice: i.unitPrice }));
    return m;
  }, [selectedItems]);

  // Initial children: 1 slot per ticket × quantity
  const initialChildren: ChildFormData[] = selectedItems.flatMap((item) =>
    Array.from({ length: item.quantity }, () => emptyChild(item.ticketTypeId)),
  );

  const { register, handleSubmit,control ,formState: { errors, isSubmitting }, getValues } =
    useForm<CheckoutFormData>({
      defaultValues: {
        contactName: buyer.contactName,
        contactPhone: buyer.contactPhone,
        contactEmail: buyer.contactEmail,
        contactAddress: buyer.contactAddress ?? "",
        children: initialChildren,
        agreed: false,
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  // Group field indices by ticketTypeId
  const groups = useMemo(() => {
    const map = new Map<number, number[]>();
    fields.forEach((f: { ticketTypeId: number }, idx: number) => {
      const arr = map.get(f.ticketTypeId) ?? [];
      arr.push(idx);
      map.set(f.ticketTypeId, arr);
    });
    return map;
  }, [fields]);

  // Live total
  const subtotal = useMemo(
    () => fields.reduce((sum: number, f: { ticketTypeId: number }) => sum + (priceMap.get(f.ticketTypeId)?.unitPrice ?? 0), 0),
    [fields, priceMap],
  );
  const discountAmount = voucher?.discount_amount ?? 0;
  const total = subtotal - discountAmount;

  async function handleApplyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    setIsValidatingVoucher(true);
    setVoucherError("");
    setVoucher(null);
    try {
      const result = await shopApi.validateVoucher(code, subtotal);
      if (result) {
        setVoucher(result);
        toast.success(`Áp dụng mã "${code}" thành công! Giảm ${formatVND(result.discount_amount)}`);
      } else {
        setVoucherError("Mã không hợp lệ hoặc đã hết hạn.");
      }
    } finally {
      setIsValidatingVoucher(false);
    }
  }

  async function onSubmit(data: CheckoutFormData) {
    try {
      const order = await shopApi.createOrder({
        contact: {
          name: data.contactName,
          phone: data.contactPhone,
          email: data.contactEmail,
          address: data.contactAddress || undefined,
        },
        children: data.children.map((c) => ({
          ticketTypeId: c.ticketTypeId,
          attendeeName: c.attendeeName,
          attendeeDob: c.attendeeDob,
          attendeeGender: c.attendeeGender || undefined,
          shirtSize: c.shirtSize || undefined,
          medalName: c.medalName || undefined,
          healthNotes: c.healthNotes || undefined,
        })),
        voucherCode: voucher?.code,
        agreedTerms: data.agreed,
        paymentMethod,
      });

      // Lưu buyer cache (reset TTL)
      setBuyer({
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        contactAddress: data.contactAddress,
      });

      // Chưa xoá giỏ ở đây — xoá khi thanh toán thành công
      router.push(`/don-hang/${order.order_code}/thanh-toan`);
    } catch (err) {
      toast.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
    }
  }

  if (!hasMounted) return null;

  if (selectedItems.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="mb-4 text-lg font-bold text-[var(--konnit-ink)]">
          Bạn chưa chọn vé nào để thanh toán.
        </p>
        <Link href="/gio-hang" className="text-sm text-[var(--konnit-berry)] underline underline-offset-4">
          Quay lại giỏ hàng
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-black text-[var(--konnit-ink)]">Thanh toán</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* ── Cột trái ── */}
        <div className="space-y-8">
          {/* Khối A: Phụ huynh */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-black text-[var(--konnit-ink)]">Thông tin phụ huynh</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ và tên *" error={errors.contactName?.message}>
                <input {...register("contactName", { required: "Vui lòng nhập họ tên" })}
                  placeholder="Nguyễn Văn A" className={inputCls(!!errors.contactName)} />
              </Field>
              <Field label="Số điện thoại *" error={errors.contactPhone?.message}>
                <input {...register("contactPhone", {
                  required: "Vui lòng nhập SĐT",
                  pattern: { value: /^[0-9]{9,11}$/, message: "SĐT không hợp lệ" },
                })} placeholder="0901234567" inputMode="tel" className={inputCls(!!errors.contactPhone)} />
              </Field>
              <Field label="Email *" error={errors.contactEmail?.message} className="sm:col-span-2">
                <input {...register("contactEmail", {
                  required: "Vui lòng nhập email",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" },
                })} placeholder="email@example.com" inputMode="email" className={inputCls(!!errors.contactEmail)} />
              </Field>
              <Field label="Địa chỉ" className="sm:col-span-2">
                <input {...register("contactAddress")}
                  placeholder="Số nhà, đường, phường, quận" className={inputCls(false)} />
              </Field>
            </div>
          </section>

          {/* Khối B: Từng bé — nhóm theo loại vé */}
          {Array.from(groups.entries()).map(([ticketTypeId, indices]) => {
            const ticketInfo = priceMap.get(ticketTypeId);
            return (
              <section key={ticketTypeId} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-[var(--konnit-ink)]">{ticketInfo?.name}</h2>
                    <p className="text-xs text-[var(--konnit-muted)]">
                      {formatVND(ticketInfo?.unitPrice ?? 0)} / bé · {indices.length} bé
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => append(emptyChild(ticketTypeId))}
                    className="flex items-center gap-1 rounded-lg border border-[var(--konnit-berry)] px-2.5 py-1 text-xs font-bold text-[var(--konnit-berry)] hover:bg-[var(--konnit-pink-02)]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Thêm bé
                  </button>
                </div>

                <div className="space-y-5">
                  {indices.map((idx, rankInGroup) => (
                    <div key={fields[idx]?.id} className="relative rounded-xl bg-slate-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500">Bé {rankInGroup + 1}</p>
                        {rankInGroup > 0 && (
                          <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
                          >
                            <Minus className="h-3 w-3" /> Bỏ bé này
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Họ và tên bé *"
                          error={(errors.children?.[idx] as { attendeeName?: { message?: string } })?.attendeeName?.message}>
                          <input {...register(`children.${idx}.attendeeName`, { required: "Vui lòng nhập tên bé" })}
                            placeholder="Nguyễn Thị B"
                            className={inputCls(!!(errors.children?.[idx] as { attendeeName?: unknown })?.attendeeName)} />
                        </Field>
                        <Field label="Ngày sinh *"
                          error={(errors.children?.[idx] as { attendeeDob?: { message?: string } })?.attendeeDob?.message}>
                          <input {...register(`children.${idx}.attendeeDob`, { required: "Vui lòng nhập ngày sinh" })}
                            type="date"
                            className={inputCls(!!(errors.children?.[idx] as { attendeeDob?: unknown })?.attendeeDob)} />
                        </Field>
                        <Field label="Giới tính">
                          <select {...register(`children.${idx}.attendeeGender`)} className={inputCls(false)}>
                            <option value="">-- Chọn --</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                          </select>
                        </Field>
                        <Field label="Size áo">
                          <select {...register(`children.${idx}.shirtSize`)} className={inputCls(false)}>
                            <option value="">-- Chọn size --</option>
                            {SHIRT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                        <Field label="Tên in huy chương" className="sm:col-span-2">
                          <input {...register(`children.${idx}.medalName`)}
                            placeholder="Để trống = dùng tên bé" className={inputCls(false)} />
                        </Field>
                        <Field label="Ghi chú sức khỏe" className="sm:col-span-2">
                          <textarea {...register(`children.${idx}.healthNotes`)} rows={2}
                            placeholder="Dị ứng, bệnh lý… (nếu có)"
                            className={inputCls(false) + " resize-none"} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Khối C: Cam kết */}
          <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <p className="mb-3 text-sm font-bold text-orange-800">Cam kết miễn trừ trách nhiệm</p>
            <p className="mb-4 text-xs leading-relaxed text-orange-700">
              Phụ huynh/người giám hộ xác nhận bé đủ sức khỏe tham gia. Ban tổ chức không chịu trách
              nhiệm về các rủi ro ngoài tầm kiểm soát và có quyền dùng hình ảnh sự kiện cho mục đích
              phi thương mại.
            </p>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm font-bold text-orange-900">
              <input type="checkbox" {...register("agreed", { required: true })}
                className="mt-0.5 h-4 w-4 accent-orange-500" />
              Tôi đã đọc, hiểu và đồng ý với cam kết trên.
            </label>
            {errors.agreed && (
              <p className="mt-1 text-xs text-red-500">Vui lòng đồng ý cam kết để tiếp tục.</p>
            )}
          </section>
        </div>

        {/* ── Cột phải (sticky) ── */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          {/* 1. Phương thức thanh toán — TRÊN CÙNG */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          {/* 2. Voucher */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Tag className="h-3.5 w-3.5" /> Mã giảm giá
            </p>
            {voucher ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-green-700">{voucher.code}</p>
                  <p className="text-xs text-green-600">Giảm {formatVND(voucher.discount_amount)}</p>
                </div>
                <button onClick={() => { setVoucher(null); setVoucherInput(""); }}
                  className="text-xs text-slate-400 hover:text-red-500 underline">Xoá</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 20))}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                  placeholder="Nhập mã nếu có"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[var(--konnit-berry)]"
                />
                <Button type="button" onClick={handleApplyVoucher}
                  disabled={isValidatingVoucher || !voucherInput.trim()}
                  variant="outline" className="shrink-0 px-3">
                  {isValidatingVoucher ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
                </Button>
              </div>
            )}
            {voucherError && <p className="mt-1 text-xs text-red-500">{voucherError}</p>}
          </div>

          {/* 3. Tóm tắt + nút submit */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-[var(--konnit-ink)]">Đơn hàng</h2>
            <div className="mb-3 space-y-1.5">
              {Array.from(groups.entries()).map(([id, idxs]) => {
                const info = priceMap.get(id);
                return (
                  <div key={id} className="flex justify-between text-sm">
                    <span className="text-slate-600">{info?.name} × {idxs.length}</span>
                    <span className="font-bold">{formatVND((info?.unitPrice ?? 0) * idxs.length)}</span>
                  </div>
                );
              })}
            </div>
            {voucher && (
              <div className="mb-2 flex justify-between text-sm text-green-600">
                <span>Giảm giá ({voucher.code})</span>
                <span>− {formatVND(discountAmount)}</span>
              </div>
            )}
            <div className="mb-4 flex justify-between border-t border-slate-100 pt-2">
              <span className="font-bold">Tổng</span>
              <span className="text-xl font-black text-[var(--konnit-berry)]">{formatVND(total)}</span>
            </div>

            <Button type="submit" disabled={isSubmitting}
              className="w-full bg-[var(--konnit-berry)] hover:bg-[var(--konnit-berry)]/90">
              {isSubmitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                : "Xác nhận đặt vé →"}
            </Button>
            <p className="mt-2 text-center text-xs text-slate-400">
              Thanh toán ở bước tiếp theo
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}

// ── Helpers ──
function inputCls(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
    "focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20",
    hasError ? "border-red-400 bg-red-50" : "border-slate-200 bg-white",
  ].join(" ");
}

function Field({ label, error, className, children }: {
  label: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-bold text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}