"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useFetch } from "@/hooks/useCmsData";
import { api } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
}

export default function NewPagePage() {
  const router = useRouter();
  const { data: categories } = useFetch<Category[]>("/admin/cms/categories");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) return;
    setLoading(true);
    try {
      const page = await api.post<{ id: number }>("/admin/cms/pages", {
        categoryId: Number(categoryId),
        title,
        slug: slug || undefined,
        description: description || undefined,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
      });
      toast.success("Đã tạo trang");
      router.push(`/admin/cms/pages/${page.id}/builder`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạo thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Tạo trang mới" />
      <Card className="max-w-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (tự sinh)</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-title">SEO Title</Label>
              <Input id="seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seo-desc">SEO Description</Label>
              <Textarea id="seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
            </div>
            <LoadingButton type="submit" loading={loading} disabled={!categoryId}>
              Tạo & mở Builder
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
