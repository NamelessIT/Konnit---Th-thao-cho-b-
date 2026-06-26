"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
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
import type { AdminEvent } from "@/lib/admin-ticketing/types";

interface EventFormState {
  id?: number;
  name: string;
  slug: string;
  description: string;
  location: string;
  mapUrl: string;
  startsAt: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  bannerPath: string;
  status: "draft" | "published" | "archived";
}

const EMPTY_FORM: EventFormState = {
  name: "",
  slug: "",
  description: "",
  location: "",
  mapUrl: "",
  startsAt: "",
  registrationOpensAt: "",
  registrationClosesAt: "",
  bannerPath: "",
  status: "draft",
};

export default function AdminEventsPage() {
  const { data: events, loading, refetch } = useFetch<AdminEvent[]>("/admin/events");
  const [form, setForm] = useState<EventFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sortedEvents = useMemo(
    () => [...(events ?? [])].sort((a, b) => b.id - a.id),
    [events],
  );

  function openCreate() {
    setForm(EMPTY_FORM);
  }

  function openEdit(event: AdminEvent) {
    setForm({
      id: event.id,
      name: event.name ?? "",
      slug: event.slug ?? "",
      description: event.description ?? "",
      location: event.location ?? "",
      mapUrl: event.map_url ?? "",
      startsAt: toLocalInputValue(event.starts_at),
      registrationOpensAt: toLocalInputValue(event.registration_opens_at),
      registrationClosesAt: toLocalInputValue(event.registration_closes_at),
      bannerPath: event.banner_path ?? "",
      status: event.status,
    });
  }

  async function handleSave() {
    if (!form?.name.trim()) {
      toast.error("Vui lòng nhập tên sự kiện");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        location: form.location.trim() || null,
        mapUrl: form.mapUrl.trim() || null,
        startsAt: fromLocalInputValue(form.startsAt),
        registrationOpensAt: fromLocalInputValue(form.registrationOpensAt),
        registrationClosesAt: fromLocalInputValue(form.registrationClosesAt),
        bannerPath: form.bannerPath.trim() || null,
        status: form.status,
      };

      if (form.id) {
        await api.patch(`/admin/events/${form.id}`, payload);
        toast.success("Đã cập nhật sự kiện");
      } else {
        await api.post("/admin/events", payload);
        toast.success("Đã tạo sự kiện");
      }

      setForm(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lưu sự kiện thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id: number) {
    try {
      await api.post(`/admin/events/${id}/publish`);
      toast.success("Đã publish sự kiện");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish thất bại");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/events/${deleteId}`);
      toast.success("Đã xóa sự kiện");
      setDeleteId(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xóa sự kiện thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sự kiện"
        description="Tạo và quản lý sự kiện bán vé"
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Tạo sự kiện
          </Button>
        }
      />

      {form && (
        <section className="mb-6 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[var(--konnit-ink)]">
                {form.id ? "Sửa sự kiện" : "Tạo sự kiện mới"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Sự kiện published mới nên được dùng để bán vé công khai.
              </p>
            </div>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Đóng
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Tên sự kiện *">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Konnit Kids Run 2026"
              />
            </Field>

            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={inputClass}
                placeholder="konnit-kids-run-2026"
              />
            </Field>

            <Field label="Địa điểm">
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
                placeholder="Công viên Tao Đàn"
              />
            </Field>

            <Field label="Google Map URL">
              <input
                value={form.mapUrl}
                onChange={(e) => setForm({ ...form, mapUrl: e.target.value })}
                className={inputClass}
                placeholder="https://maps.google.com/..."
              />
            </Field>

            <Field label="Bắt đầu sự kiện">
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Mở đăng ký">
              <input
                type="datetime-local"
                value={form.registrationOpensAt}
                onChange={(e) =>
                  setForm({ ...form, registrationOpensAt: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Đóng đăng ký">
              <input
                type="datetime-local"
                value={form.registrationClosesAt}
                onChange={(e) =>
                  setForm({ ...form, registrationClosesAt: e.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Banner path">
              <input
                value={form.bannerPath}
                onChange={(e) => setForm({ ...form, bannerPath: e.target.value })}
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
                    status: e.target.value as EventFormState["status"],
                  })
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>

            <Field label="Mô tả" className="md:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} min-h-28 resize-y py-2`}
                placeholder="Mô tả ngắn về sự kiện"
              />
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setForm(null)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu sự kiện"}
            </Button>
          </div>
        </section>
      )}

      {loading && <p className="text-muted-foreground">Đang tải...</p>}

      {!loading && sortedEvents.length === 0 && (
        <EmptyState
          title="Chưa có sự kiện"
          description="Tạo sự kiện đầu tiên để gắn loại vé và bán vé."
          action={<Button onClick={openCreate}>Tạo sự kiện</Button>}
        />
      )}

      {sortedEvents.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên sự kiện</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ngày diễn ra</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    <CalendarDays className="size-4 text-[var(--konnit-berry)]" />
                    {event.name}
                  </div>
                  {event.location && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.location}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{event.slug}</TableCell>
                <TableCell className="text-muted-foreground">
                  {event.starts_at
                    ? new Date(event.starts_at).toLocaleString("vi-VN")
                    : "Chưa đặt"}
                </TableCell>
                <TableCell>
                  <Badge variant={event.status === "published" ? "default" : "secondary"}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(event)}>
                    <Pencil className="mr-1 size-3.5" />
                    Sửa
                  </Button>

                  {event.status !== "published" && (
                    <Button variant="ghost" size="sm" onClick={() => handlePublish(event.id)}>
                      Publish
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteId(event.id)}
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa sự kiện?"
        description="Sự kiện sẽ bị xóa hoặc ẩn khỏi hệ thống tùy theo backend. Hãy chắc chắn không còn vé đang bán."
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