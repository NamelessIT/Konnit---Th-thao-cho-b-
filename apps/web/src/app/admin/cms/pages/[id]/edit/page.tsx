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

interface CmsPage {
  title: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export default function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get<CmsPage>(`/admin/cms/pages/${id}`).then((page) => {
      setTitle(page.title);
      setSlug(page.slug);
      setDescription(page.description ?? "");
      setSeoTitle(page.seo_title ?? "");
      setSeoDescription(page.seo_description ?? "");
      setFetching(false);
    });
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/admin/cms/pages/${id}`, {
        title,
        slug,
        description,
        seoTitle,
        seoDescription,
      });
      toast.success("Đã cập nhật trang");
      router.push("/admin/cms/pages");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <p className="text-muted-foreground">Đang tải...</p>;

  return (
    <div>
      <PageHeader title="Sửa trang" />
      <Card className="max-w-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
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
            <LoadingButton type="submit" loading={loading}>
              Lưu
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
