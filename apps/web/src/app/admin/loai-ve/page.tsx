"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Ticket, Trash2 } from "lucide-react";
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
import type { AdminEvent, AdminTicketType } from "@/lib/admin-ticketing/types";

interface TicketFormState {
  id?: number;
  eventId: string;
  name: string;
  slug: string;
  description: string;
  ageGroup: string;
  ageMin: string;
  ageMax: string;
  genderRestriction: "any" | "male" | "female";
  price: string;
  earlyBirdPrice: string;
  earlyBirdUntil: string;
  quotaTotal: string;
  includesShirt: boolean;
  imagePath: string;
  sortOrder: string;
  status: "draft" | "published" | "archived";
}

const EMPTY_FORM: TicketFormState = {
  eventId: "",
  name: "",
  slug: "",
  description: "",
  ageGroup: "",
  ageMin: "",
  ageMax: "",
  genderRestriction: "any",
  price: "",
  earlyBirdPrice: "",
  earlyBirdUntil: "",
  quotaTotal: "0",
  includesShirt: false,
  imagePath: "",
  sortOrder: "0",
  status: "draft",
};

export default function AdminTicketTypesPage() {
  const { data: events, loading: eventsLoading } =
    useFetch<AdminEvent[]>("/admin/events");
  const {
    data: tickets,
    loading: ticketsLoading,
    refetch,
  } = useFetch<AdminTicketType[]>("/admin/ticket-types");

  const [form, setForm] = useState<TicketFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refetch();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [refetch]);

  const eventMap = useMemo(() => {
    const map = new Map<number, string>();
    (events ?? []).forEach((event) => map.set(event.id, event.name));
    return map;
  }, [events]);

  const sortedTickets = useMemo(
    () => [...(tickets ?? [])].sort((a, b) => b.id - a.id),
    [tickets],
  );

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      eventId: events?.[0]?.id ? String(events[0].id) : "",
    });
  }

  function openEdit(ticket: AdminTicketType) {
    setForm({
      id: ticket.id,
      eventId: String(ticket.event_id),
      name: ticket.name ?? "",
      slug: ticket.slug ?? "",
      description: ticket.description ?? "",
      ageGroup: ticket.age_group ?? "",
      ageMin: ticket.age_min == null ? "" : String(ticket.age_min),
      ageMax: ticket.age_max == null ? "" : String(ticket.age_max),
      genderRestriction: ticket.gender_restriction ?? "any",
      price: String(ticket.price ?? 0),
      earlyBirdPrice:
        ticket.early_bird_price == null ? "" : String(ticket.early_bird_price),
      earlyBirdUntil: toLocalInputValue(ticket.early_bird_until),
      quotaTotal: String(ticket.quota_total ?? 0),
      includesShirt: Boolean(ticket.includes_shirt),
      imagePath: ticket.image_path ?? "",
      sortOrder: String(ticket.sort_order ?? 0),
      status: ticket.status,
    });
  }

  async function handleSave() {
    if (!form) return;

    if (!form.eventId) {
      toast.error("Vui lòng chọn sự kiện");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên loại vé");
      return;
    }

    const price = toInteger(form.price);
    const quotaTotal = toInteger(form.quotaTotal);

    if (price < 0 || quotaTotal < 0) {
      toast.error("Giá và số suất không hợp lệ");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        eventId: Number(form.eventId),
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        ageGroup: form.ageGroup.trim() || null,
        ageMin: form.ageMin === "" ? null : toInteger(form.ageMin),
        ageMax: form.ageMax === "" ? null : toInteger(form.ageMax),
        genderRestriction: form.genderRestriction,
        price,
        earlyBirdPrice:
          form.earlyBirdPrice === "" ? null : toInteger(form.earlyBirdPrice),
        earlyBirdUntil: fromLocalInputValue(form.earlyBirdUntil),
        quotaTotal,
        includesShirt: form.includesShirt,
        imagePath: form.imagePath.trim() || null,
        sortOrder: toInteger(form.sortOrder),
        status: form.status,
      };

      if (form.id) {
        const { eventId, ...updatePayload } = payload;
        await api.patch(`/admin/ticket-types/${form.id}`, updatePayload);
        toast.success("Đã cập nhật loại vé");
      } else {
        await api.post("/admin/ticket-types", payload);
        toast.success("Đã tạo loại vé");
      }

      setForm(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lưu loại vé thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/ticket-types/${deleteId}`);
      toast.success("Đã xóa loại vé");
      setDeleteId(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xóa loại vé thất bại");
    } finally {
      setDeleting(false);
    }
  }

  const loading = eventsLoading || ticketsLoading;

  return (
    <div>
      <PageHeader
        title="Loại vé"
        description="Tạo và quản lý các vé bán cho từng sự kiện"
        actions={
          <Button onClick={openCreate} disabled={!events?.length}>
            <Plus className="mr-2 size-4" />
            Tạo loại vé
          </Button>
        }
      />

      {!eventsLoading && (!events || events.length === 0) && (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          Cần tạo ít nhất một sự kiện trước khi tạo loại vé.
        </div>
      )}

      {form && (
        <section className="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[var(--konnit-ink)]">
                {form.id ? "Sửa loại vé" : "Tạo loại vé mới"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Vé published sẽ được dùng để hiển thị ở cửa hàng khi nối API thật.
              </p>
            </div>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Đóng
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Sự kiện *">
              <select
                value={form.eventId}
                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                disabled={Boolean(form.id)}
                className={inputClass}
              >
                <option value="">-- Chọn sự kiện --</option>
                {(events ?? []).map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tên loại vé *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Vé Chồi"
              />
            </Field>

            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={inputClass}
                placeholder="ve-choi"
              />
            </Field>

            <Field label="Nhóm tuổi">
              <input
                value={form.ageGroup}
                onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                className={inputClass}
                placeholder="4-6 tuổi"
              />
            </Field>

            <Field label="Tuổi nhỏ nhất">
              <input
                type="number"
                min={0}
                value={form.ageMin}
                onChange={(e) => setForm({ ...form, ageMin: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Tuổi lớn nhất">
              <input
                type="number"
                min={0}
                value={form.ageMax}
                onChange={(e) => setForm({ ...form, ageMax: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Giới tính">
              <select
                value={form.genderRestriction}
                onChange={(e) =>
                  setForm({
                    ...form,
                    genderRestriction: e.target.value as TicketFormState["genderRestriction"],
                  })
                }
                className={inputClass}
              >
                <option value="any">Tất cả</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </Field>

            <Field label="Giá vé *">
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
                placeholder="300000"
              />
            </Field>

            <Field label="Giá early-bird">
              <input
                type="number"
                min={0}
                value={form.earlyBirdPrice}
                onChange={(e) =>
                  setForm({ ...form, earlyBirdPrice: e.target.value })
                }
                className={inputClass}
                placeholder="250000"
              />
            </Field>

            <Field label="Hạn early-bird">
              <input
                type="datetime-local"
                value={form.earlyBirdUntil}
                onChange={(e) =>
                  setForm({ ...form, earlyBirdUntil: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Tổng suất *">
              <input
                type="number"
                min={0}
                value={form.quotaTotal}
                onChange={(e) => setForm({ ...form, quotaTotal: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Thứ tự">
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Ảnh vé">
              <input
                value={form.imagePath}
                onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
                className={inputClass}
                placeholder="/uploads/..."
              />
            </Field>

            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as TicketFormState["status"],
                  })
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>

            <label className="flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={form.includesShirt}
                onChange={(e) =>
                  setForm({ ...form, includesShirt: e.target.checked })
                }
                className="h-4 w-4 accent-[var(--konnit-berry)]"
              />
              Vé có kèm áo
            </label>

            <Field label="Mô tả" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={`${inputClass} min-h-28 resize-y py-2`}
                placeholder="Mô tả quyền lợi vé"
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setForm(null)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu loại vé"}
            </Button>
          </div>
        </section>
      )}

      {loading && <p className="text-muted-foreground">Đang tải...</p>}

      {!loading && sortedTickets.length === 0 && (
        <EmptyState
          title="Chưa có loại vé"
          description="Tạo loại vé để bán trên trang cửa hàng."
          action={
            <Button onClick={openCreate} disabled={!events?.length}>
              Tạo loại vé
            </Button>
          }
        />
      )}

      {sortedTickets.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vé</TableHead>
              <TableHead>Sự kiện</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Suất</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTickets.map((ticket) => {
              const sold = ticket.sold_count ?? 0;
              const reserved = ticket.reserved_count ?? 0;
              const available = Math.max(ticket.quota_total - sold - reserved, 0);

              return (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <Ticket className="size-4 text-[var(--konnit-berry)]" />
                      {ticket.name}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticket.age_group || "Chưa đặt nhóm tuổi"}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.event_name || eventMap.get(ticket.event_id) || `#${ticket.event_id}`}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatVND(ticket.price)}</div>
                    {ticket.early_bird_price != null && (
                      <div className="text-xs text-orange-600">
                        Early: {formatVND(ticket.early_bird_price)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    Còn {available}/{ticket.quota_total}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ticket.status === "published" ? "default" : "secondary"}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(ticket)}>
                      <Pencil className="mr-1 size-3.5" />
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteId(ticket.id)}
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
        title="Xóa loại vé?"
        description="Loại vé sẽ bị xóa hoặc ẩn khỏi hệ thống tùy theo backend. Không nên xóa vé đã phát sinh đơn hàng."
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
