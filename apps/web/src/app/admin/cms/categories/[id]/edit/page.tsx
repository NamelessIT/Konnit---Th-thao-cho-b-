"use client";

import { useState, useEffect, type FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get<Category>(`/admin/cms/categories/${id}`).then((cat) => {
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description ?? "");
      setFetching(false);
    });
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/admin/cms/categories/${id}`, { name, slug, description });
      toast.success("Đã cập nhật danh mục");
      router.push("/admin/cms/categories");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <p className="text-muted-foreground">Đang tải...</p>;

  return (
    <div>
      <PageHeader title="Sửa danh mục" />
      <Card className="max-w-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <LoadingButton type="submit" loading={loading}>
              Lưu
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
