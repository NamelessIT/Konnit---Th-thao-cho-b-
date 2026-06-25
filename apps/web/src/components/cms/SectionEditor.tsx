"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

interface Section {
  id: number;
  component_type: string;
  style_variant: string;
  title: string | null;
  description: string | null;
  content_json: Record<string, unknown>;
}

interface SectionEditorProps {
  section: Section;
  onUpdated: () => void;
  onLiveChange?: (draft: {
    title: string;
    description: string;
    contentJson: Record<string, unknown>;
  }) => void;
}

export function SectionEditor({ section, onUpdated, onLiveChange }: SectionEditorProps) {
  const [title, setTitle] = useState(section.title ?? "");
  const [description, setDescription] = useState(section.description ?? "");
  const [contentJson, setContentJson] = useState<Record<string, unknown>>(
    section.content_json ?? {},
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      setTitle(section.title ?? "");
      setDescription(section.description ?? "");
      setContentJson(section.content_json ?? {});
  }, [section.id]);

  // Push live edits up so the builder can render a realtime WYSIWYG preview.
  useEffect(() => {
    onLiveChange?.({ title, description, contentJson });
  }, [title, description, contentJson, onLiveChange]);

  const debouncedContent = useDebounce(contentJson, 500);

  const autoSave = useCallback(async () => {
      try {
        await api.patch(`/admin/cms/sections/${section.id}`, {
          title: title || null,
          description: description || null,
          contentJson: debouncedContent,
        });
      } catch {
        // silent autosave failure
      }
  }, [section.id, title, description, debouncedContent]);

  useEffect(() => {
    const timer = setTimeout(autoSave, 1000);
    return () => clearTimeout(timer);
  }, [autoSave]);

  function updateField(key: string, value: unknown) {
    setContentJson((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch(`/admin/cms/sections/${section.id}`, {
        title: title || null,
        description: description || null,
        contentJson,
      });
      toast.success("Đã lưu section");
      onUpdated();
    } catch {
      toast.error("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  const fields = getFieldsForType(section.component_type);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          {section.component_type} — {section.style_variant}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tiêu đề section</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Mô tả section</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {fields.map((field) => (
          <div key={field} className="space-y-2">
            <Label>{field}</Label>
            {field === "content" || field === "note" ? (
              <Textarea
                value={(contentJson[field] as string) ?? ""}
                onChange={(e) => updateField(field, e.target.value)}
                rows={field === "content" ? 6 : 3}
              />
            ) : field === "image" ? (
              <div className="space-y-2">
                <Input
                  placeholder="Dán URL ảnh (Sao chép từ Media)"
                  value={(contentJson[field] as string) ?? ""}
                  onChange={(e) => updateField(field, e.target.value)}
                />
                {(contentJson[field] as string) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={contentJson[field] as string}
                    alt="preview"
                    className="h-28 w-full rounded-lg border border-[var(--konnit-pink-03)] object-cover"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Mẹo: vào mục Media → Sao chép URL → dán vào đây.
                  </p>
                )}
              </div>
            ) : field === "items" ? (
              <ItemsEditor
                items={(contentJson.items as Record<string, string>[] | undefined) ?? []}
                onChange={(items) => updateField("items", items)}
              />
            ) : (
              <Input
                value={(contentJson[field] as string) ?? ""}
                onChange={(e) => updateField(field, e.target.value)}
              />
            )}
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Đang lưu…" : "Lưu section"}
        </Button>
      </CardContent>
    </Card>
  );
}

function getFieldsForType(type: string): string[] {
  const map: Record<string, string[]> = {
    hero: ["title", "description", "content", "note", "image", "primaryCta", "secondaryCta"],
    rich_text: ["title", "description", "content", "note"],
    image_text: ["title", "description", "content", "note", "image", "imagePosition"],
    feature_grid: ["title", "description", "items"],
    schedule: ["title", "description", "items"],
    faq: ["title", "description", "items"],
    cta: ["title", "description", "buttonLabel", "buttonUrl", "note"],
    sponsor: ["title", "description"],
    note_alert: ["title", "description", "content", "note", "tone"],
    ticket_preview: ["title", "description", "items", "note"],
  };
  return map[type] ?? ["title", "description", "content"];
}

function ItemsEditor({
  items,
  onChange,
}: {
  items: Record<string, string>[];
  onChange: (items: Record<string, string>[]) => void;
}) {
  function addItem() {
    onChange([...items, { title: "", description: "" }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, key: string, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Tiêu đề"
              value={item.title ?? ""}
              onChange={(e) => updateItem(i, "title", e.target.value)}
            />
            <Input
              placeholder="Mô tả"
              value={item.description ?? ""}
              onChange={(e) => updateItem(i, "description", e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => removeItem(i)}>
            ✕
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        + Thêm item
      </Button>
    </div>
  );
}
