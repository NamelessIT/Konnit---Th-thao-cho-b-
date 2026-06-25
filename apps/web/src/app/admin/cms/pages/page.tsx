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

interface CmsPage {
  id: number;
  title: string;
  slug: string;
  status: string;
  category_name: string;
  updated_at: string;
}

export default function PagesListPage() {
  const { data: pages, loading, refetch } = useFetch<CmsPage[]>("/admin/cms/pages");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/cms/pages/${deleteId}`);
      toast.success("Đã xóa trang");
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
      await api.post(`/admin/cms/pages/${id}/publish`);
      toast.success("Đã publish trang");
      refetch();
    } catch {
      toast.error("Publish thất bại");
    }
  }

  return (
    <div>
      <PageHeader
        title="Trang"
        description="Quản lý trang CMS"
        actions={
          <Button render={<Link href="/admin/cms/pages/new" />}>
            Tạo trang
          </Button>
        }
      />

      {loading && <p className="text-muted-foreground">Đang tải...</p>}

      {!loading && (!pages || pages.length === 0) && (
        <EmptyState
          title="Chưa có trang nào"
          description="Tạo trang đầu tiên để bắt đầu xây dựng nội dung"
          action={
            <Button render={<Link href="/admin/cms/pages/new" />}>
              Tạo trang
            </Button>
          }
        />
      )}

      {pages && pages.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="text-muted-foreground">{page.category_name}</TableCell>
                <TableCell className="text-muted-foreground">{page.slug}</TableCell>
                <TableCell>
                  <Badge variant={page.status === "published" ? "default" : "secondary"}>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(page.updated_at).toLocaleDateString("vi")}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/admin/cms/pages/${page.id}/builder`} />}
                  >
                    Builder
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/admin/cms/pages/${page.id}/edit`} />}
                  >
                    Sửa
                  </Button>
                  {page.status !== "published" && (
                    <Button variant="ghost" size="sm" onClick={() => handlePublish(page.id)}>
                      Publish
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteId(page.id)}
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
        title="Xóa trang?"
        description="Trang và tất cả sections sẽ bị ẩn. Bạn có thể liên hệ admin để khôi phục."
        confirmLabel="Xóa"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
