"use client";

import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, FileText, Copy, Trash2, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/hooks/useCmsData";
import { api } from "@/lib/api-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const ACCEPT = "image/jpeg,image/png,image/webp,image/svg+xml,application/pdf";
const MAX_SIZE = 5 * 1024 * 1024;

interface UploadRecord {
  id: number;
  original_name: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  path: string;
  created_at: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileUrl(path: string) {
  return `${BASE_URL}/${path}`;
}

export default function UploadsPage() {
  const { data: files, loading, refetch } = useFetch<UploadRecord[]>("/admin/uploads");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function uploadOne(file: File): Promise<boolean> {
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name} vượt quá 5MB`);
      return false;
    }
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/api/admin/uploads`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message ?? `Tải lên ${file.name} thất bại`);
      return false;
    }
    return true;
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(fileList)) {
      if (await uploadOne(file)) ok++;
    }
    setUploading(false);
    if (ok > 0) {
      toast.success(`Đã tải lên ${ok} tệp`);
      refetch();
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  async function copyUrl(path: string) {
    try {
      await navigator.clipboard.writeText(fileUrl(path));
      toast.success("Đã sao chép URL");
    } catch {
      toast.error("Không sao chép được");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/uploads/${deleteId}`);
      toast.success("Đã xóa tệp");
      setDeleteId(null);
      refetch();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Quản lý hình ảnh và tài liệu — kéo thả hoặc bấm để tải lên"
        actions={
          <Button
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="bg-[var(--konnit-berry)] text-white"
          >
            <Plus className="size-4" />
            {uploading ? "Đang tải lên…" : "Tải lên"}
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver
            ? "border-[var(--konnit-pink-05)] bg-[var(--konnit-pink-02)]"
            : "border-[var(--konnit-pink-03)] hover:bg-[var(--konnit-pink-01)]"
        }`}
      >
        <UploadCloud className="size-8 text-[var(--konnit-pink-05)]" />
        <p className="font-medium text-[var(--konnit-ink)]">
          Kéo thả tệp vào đây hoặc bấm để chọn
        </p>
        <p className="text-xs text-[var(--konnit-muted)]">
          JPG, PNG, WebP, SVG, PDF · tối đa 5MB
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && (!files || files.length === 0) && (
        <EmptyState
          title="Chưa có tệp nào"
          description="Tải lên hình ảnh hoặc tài liệu đầu tiên"
        />
      )}

      {!loading && files && files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => {
            const isImage = f.mime_type.startsWith("image/");
            return (
              <div
                key={f.id}
                className="group overflow-hidden rounded-xl border border-[var(--konnit-pink-03)] bg-card transition-shadow hover:shadow-md"
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[var(--konnit-pink-01)]">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileUrl(f.path)}
                      alt={f.original_name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <FileText className="size-12 text-[var(--konnit-muted)]" />
                  )}

                  {/* Hover actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyUrl(f.path)}
                    >
                      <Copy className="size-3.5" /> URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(f.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-2.5">
                  <p
                    className="truncate text-sm font-medium text-[var(--konnit-ink)]"
                    title={f.original_name}
                  >
                    {f.original_name}
                  </p>
                  <p className="text-xs text-[var(--konnit-muted)]">
                    {formatSize(f.size_bytes)} ·{" "}
                    {new Date(f.created_at).toLocaleDateString("vi")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa tệp này?"
        description="Tệp sẽ bị ẩn khỏi thư viện. Hành động này không xóa file vật lý trên máy chủ."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
