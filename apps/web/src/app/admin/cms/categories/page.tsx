"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
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

interface Category {
  id: number;
  name: string;
  slug: string;
  status: string;
  sort_order: number;
  created_at: string;
}

export default function CategoriesPage() {
  const { data: categories, loading, refetch } = useFetch<Category[]>("/admin/cms/categories");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/cms/categories/${deleteId}`);
      toast.success("Đã xóa danh mục");
      setDeleteId(null);
      refetch();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  }

  async function handlePublish(id: number) {
    try {
      await api.post(`/admin/cms/categories/${id}/publish`);
      toast.success("Đã publish danh mục");
      refetch();
    } catch {
      toast.error("Publish thất bại");
    }
  }

  return (
    <div>
      <PageHeader
        title="Danh mục"
        description="Quản lý danh mục CMS"
        actions={
          <Button render={<Link href="/admin/cms/categories/new" />}>
            Tạo danh mục
          </Button>
        }
      />

      {loading && <p className="text-muted-foreground">Đang tải...</p>}

      {!loading && (!categories || categories.length === 0) && (
        <EmptyState
          title="Chưa có danh mục nào"
          description="Tạo danh mục đầu tiên để bắt đầu"
          action={
            <Button render={<Link href="/admin/cms/categories/new" />}>
              Tạo danh mục
            </Button>
          }
        />
      )}

      {categories && categories.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                <TableCell>
                  <Badge variant={cat.status === "published" ? "default" : "secondary"}>
                    {cat.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(cat.created_at).toLocaleDateString("vi")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/admin/cms/categories/${cat.id}/edit`} />}
                  >
                    Sửa
                  </Button>
                  {cat.status !== "published" && (
                    <Button variant="ghost" size="sm" onClick={() => handlePublish(cat.id)}>
                      Publish
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteId(cat.id)}
                  >
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
        title="Xóa danh mục?"
        description="Danh mục sẽ bị ẩn khỏi hệ thống. Bạn có thể liên hệ admin để khôi phục."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
