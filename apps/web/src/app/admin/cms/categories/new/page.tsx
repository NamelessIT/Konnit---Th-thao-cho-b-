"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingButton } from "@/components/common/LoadingButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api-client";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/cms/categories", {
        name,
        slug: slug || undefined,
        description: description || undefined,
      });
      toast.success("Đã tạo danh mục");
      router.push("/admin/cms/categories");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tạo thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Tạo danh mục mới" />
      <Card className="max-w-lg">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (tự sinh nếu bỏ trống)</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <LoadingButton type="submit" loading={loading}>
              Tạo
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
