"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BadgePercent, Pencil, Plus, Trash2 } from "lucide-react";
import {
  DISCOUNT_TYPE,
  DISCOUNT_TYPE_LABELS_VI,
  DISCOUNT_TYPES,
  VOUCHER_STATUS,
  VOUCHER_STATUS_LABELS_VI,
  VOUCHER_STATUSES,
  type DiscountType,
  type VoucherStatus,
} from "@konnit/types";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetch } from "@/hooks/useCmsData";
import { api } from "@/lib/api-client";
import { formatVND } from "@/lib/shop/format";
import type { AdminVoucher } from "@/lib/admin-ticketing/types";

interface VoucherFormState {
  id?: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
  status: VoucherStatus;
}

const EMPTY_FORM: VoucherFormState = {
  code: "",
  description: "",
  discountType: DISCOUNT_TYPE.PERCENT,
  discountValue: "",
  minOrderAmount: "0",
  maxUses: "",
  startsAt: "",
  expiresAt: "",
  status: VOUCHER_STATUS.ACTIVE,
};

export default function AdminVouchersPage() {
  const { data: vouchers, loading, refetch } = useFetch<AdminVoucher[]>("/admin/vouchers");
  const [form, setForm] = useState<VoucherFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sortedVouchers = useMemo(
    () => [...(vouchers ?? [])].sort((a, b) => b.id - a.id),
    [vouchers],
  );

  function openCreate() {
    setForm(EMPTY_FORM);
  }

  function openEdit(voucher: AdminVoucher) {
    setForm({
      id: voucher.id,
      code: voucher.code ?? "",
      description: voucher.description ?? "",
      discountType: voucher.discount_type,
      discountValue: String(voucher.discount_value ?? 0),
      minOrderAmount: String(voucher.min_order_amount ?? 0),
      maxUses: voucher.max_uses == null ? "" : String(voucher.max_uses),
      startsAt: toLocalInputValue(voucher.starts_at),
      expiresAt: toLocalInputValue(voucher.expires_at),
      status: voucher.status,
    });
  }

  async function handleSave() {
    if (!form) return;

    if (!form.code.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }

    const discountValue = toInteger(form.discountValue);
    const minOrderAmount = toInteger(form.minOrderAmount);

    if (discountValue <= 0) {
      toast.error("Giá trị giảm phải lớn hơn 0");
      return;
    }

    if (form.discountType === DISCOUNT_TYPE.PERCENT && discountValue > 100) {
      toast.error("Giảm theo phần trăm không thể vượt quá 100%");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue,
        minOrderAmount,
        maxUses: form.maxUses === "" ? null : toInteger(form.maxUses),
        startsAt: fromLocalInputValue(form.startsAt),
        expiresAt: fromLocalInputValue(form.expiresAt),
        status: form.status,
      };

      if (form.id) {
        await api.patch(`/admin/vouchers/${form.id}`, payload);
        toast.success("Đã cập nhật voucher");
      } else {
        await api.post("/admin/vouchers", payload);
        toast.success("Đã tạo voucher");
      }

      setForm(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lưu voucher thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/vouchers/${deleteId}`);
      toast.success("Đã xóa voucher");
      setDeleteId(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xóa voucher thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Voucher / Coupon"
        description="Tạo và quản lý mã giảm giá cho đơn hàng"
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Tạo voucher
          </Button>
        }
      />

      {form && (
        <section className="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[var(--konnit-ink)]">
                {form.id ? "Sửa voucher" : "Tạo voucher mới"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Mã sẽ tự động chuyển thành chữ in hoa khi lưu. Voucher active mới được dùng để giảm giá.
              </p>
            </div>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Đóng
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Mã voucher *">
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className={inputClass}
                placeholder="KONNIT10"
                maxLength={50}
              />
            </Field>

            <Field label="Loại giảm giá">
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discountType: e.target.value as DiscountType,
                  })
                }
                className={inputClass}
              >
                {DISCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {DISCOUNT_TYPE_LABELS_VI[type]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Giá trị giảm *">
              <input
                type="number"
                min={1}
                value={form.discountValue}
                onChange={(e) =>
                  setForm({ ...form, discountValue: e.target.value })
                }
                className={inputClass}
                placeholder={form.discountType === DISCOUNT_TYPE.PERCENT ? "10" : "50000"}
              />
            </Field>

            <Field label="Đơn tối thiểu">
              <input
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={(e) =>
                  setForm({ ...form, minOrderAmount: e.target.value })
                }
                className={inputClass}
                placeholder="0"
              />
            </Field>

            <Field label="Số lượt tối đa">
              <input
                type="number"
                min={1}
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className={inputClass}
                placeholder="Để trống nếu không giới hạn"
              />
            </Field>

            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as VoucherStatus,
                  })
                }
                className={inputClass}
              >
                {VOUCHER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {VOUCHER_STATUS_LABELS_VI[status]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Hiệu lực từ">
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Hết hạn">
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Mô tả" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={`${inputClass} min-h-28 resize-y py-2`}
                placeholder="Mô tả ngắn về voucher, ví dụ: Giảm 10% cho đơn đầu tiên"
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setForm(null)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu voucher"}
            </Button>
          </div>
        </section>
      )}

      {loading && <p className="text-muted-foreground">Đang tải...</p>}

      {!loading && sortedVouchers.length === 0 && (
        <EmptyState
          title="Chưa có voucher"
          description="Tạo mã giảm giá để áp dụng cho đơn hàng của khách."
          action={<Button onClick={openCreate}>Tạo voucher</Button>}
        />
      )}

      {sortedVouchers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Đã dùng</TableHead>
              <TableHead>Hiệu lực</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVouchers.map((voucher) => {
              const now = Date.now();
              const startsAt = voucher.starts_at ? new Date(voucher.starts_at).getTime() : null;
              const expiresAt = voucher.expires_at ? new Date(voucher.expires_at).getTime() : null;
              const isExpired = expiresAt ? now > expiresAt : false;
              const isNotYetActive = startsAt ? now < startsAt : false;
              const maxedOut =
                voucher.max_uses != null && voucher.used_count >= voucher.max_uses;

              return (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <BadgePercent className="size-4 text-[var(--konnit-berry)]" />
                      {voucher.code}
                    </div>
                    {voucher.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                        {voucher.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {voucher.discount_type === DISCOUNT_TYPE.PERCENT ? (
                      <span className="font-medium">{voucher.discount_value}%</span>
                    ) : (
                      <span className="font-medium">{formatVND(voucher.discount_value)}</span>
                    )}
                    {voucher.min_order_amount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Đơn tối thiểu {formatVND(voucher.min_order_amount)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {voucher.used_count}
                    {voucher.max_uses != null && (
                      <> / {voucher.max_uses}</>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {voucher.starts_at || voucher.expires_at ? (
                      <>
                        {voucher.starts_at && (
                          <div>
                            Từ: {new Date(voucher.starts_at).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                        {voucher.expires_at && (
                          <div>
                            Đến: {new Date(voucher.expires_at).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs">Không giới hạn</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {voucher.status === VOUCHER_STATUS.DISABLED ? (
                      <Badge variant="secondary">
                        {VOUCHER_STATUS_LABELS_VI[voucher.status]}
                      </Badge>
                    ) : isExpired || maxedOut ? (
                      <Badge variant="destructive">Hết hạn</Badge>
                    ) : isNotYetActive ? (
                      <Badge variant="secondary">Sắp kích hoạt</Badge>
                    ) : (
                      <Badge variant="default">
                        {VOUCHER_STATUS_LABELS_VI[voucher.status]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(voucher)}>
                      <Pencil className="mr-1 size-3.5" />
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteId(voucher.id)}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa voucher?"
        description="Voucher sẽ bị xóa khỏi hệ thống. Không nên xóa voucher đã được sử dụng trong đơn hàng."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-[var(--konnit-ink)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function toInteger(value: string) {
  const parsed = Number.parseInt(value || "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toLocalInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromLocalInputValue(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20";
