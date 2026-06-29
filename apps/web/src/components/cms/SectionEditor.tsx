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

const COMPONENT_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  rich_text: "Văn bản",
  image_text: "Ảnh + Văn bản",
  feature_grid: "Lưới tính năng",
  schedule: "Lịch trình",
  faq: "Câu hỏi thường gặp",
  cta: "Kêu gọi hành động",
  sponsor: "Nhà tài trợ",
  note_alert: "Thông báo",
  ticket_preview: "Bảng giá vé",
  product: "Sản phẩm",
  contact_panel: "Liên hệ",
  flow_steps: "Các bước (numbered)",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Tiêu đề",
  description: "Mô tả",
  content: "Nội dung",
  note: "Ghi chú",
  image: "Ảnh",
  imagePosition: "Vị trí ảnh",
  primaryCta: "Nút chính (label|url)",
  secondaryCta: "Nút phụ (label|url)",
  buttonLabel: "Nhãn nút",
  buttonUrl: "Đường dẫn nút",
  items: "Danh sách items",
  tone: "Màu sắc thông báo",
  logos: "Logo nhà tài trợ",
  label: "Nhãn nhỏ (eyebrow)",
  phone: "Số điện thoại",
};

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
          {COMPONENT_LABELS[section.component_type] ?? section.component_type} — {section.style_variant}
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
            <Label>{FIELD_LABELS[field] ?? field}</Label>
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
                componentType={section.component_type}
                items={(contentJson.items as Record<string, unknown>[] | undefined) ?? []}
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
    product: ["title", "description", "items"],
    contact_panel: ["title", "description", "label", "phone", "primaryCta", "secondaryCta"],
    flow_steps: ["title", "description", "items"],
  };
  return map[type] ?? ["title", "description", "content"];
}

type ItemFieldKind = "text" | "csv" | "facts";
interface ItemFieldDef { key: string; placeholder: string; kind?: ItemFieldKind }

// Editable fields per section type, so the new demo-driven types are editable in the builder.
const ITEM_FIELDS: Record<string, ItemFieldDef[]> = {
  product: [
    { key: "tag", placeholder: "Tag (Safety / Bike / Camp…)" },
    { key: "title", placeholder: "Tiêu đề" },
    { key: "description", placeholder: "Mô tả" },
    { key: "tint", placeholder: "Tông màu (pink / mint / sky / sun)" },
    { key: "ageFit", placeholder: "Độ tuổi (vd 2.5-6 years)" },
    { key: "safetyNote", placeholder: "Ghi chú an toàn" },
    { key: "included", placeholder: "Bao gồm (style kit-card)" },
    { key: "photos", placeholder: "Ảnh — nhãn cách nhau dấu phẩy", kind: "csv" },
    { key: "ctaLabel", placeholder: "Nhãn nút (kit-card)" },
    { key: "ctaUrl", placeholder: "Link nút (kit-card)" },
    { key: "linkLabel", placeholder: "Nhãn link (catalog)" },
    { key: "linkUrl", placeholder: "Link (catalog)" },
  ],
  feature_grid: [
    { key: "icon", placeholder: "Icon / số (vd ↗ hoặc 01)" },
    { key: "tint", placeholder: "Tông màu (bike / camp / science)" },
    { key: "title", placeholder: "Tiêu đề" },
    { key: "description", placeholder: "Mô tả" },
    { key: "meta", placeholder: "Pill (vd độ tuổi)" },
    { key: "linkLabel", placeholder: "Nhãn link" },
    { key: "linkUrl", placeholder: "Link" },
    { key: "photos", placeholder: "Ảnh — nhãn cách nhau dấu phẩy", kind: "csv" },
  ],
  flow_steps: [
    { key: "step", placeholder: "Số bước (01, 02…) — bỏ trống để tự đánh" },
    { key: "title", placeholder: "Tiêu đề" },
    { key: "description", placeholder: "Mô tả" },
  ],
  image_text: [
    { key: "label", placeholder: "Label pill (vd Movement)" },
    { key: "tint", placeholder: "Tông màu (pink / mint / sky / sun)" },
    { key: "title", placeholder: "Tiêu đề" },
    { key: "description", placeholder: "Mô tả" },
    { key: "photos", placeholder: "Ảnh — nhãn cách nhau dấu phẩy", kind: "csv" },
    { key: "facts", placeholder: "Facts — mỗi dòng: nhãn | giá trị", kind: "facts" },
  ],
  ticket_preview: [
    { key: "title", placeholder: "Tiêu đề" },
    { key: "price", placeholder: "Giá (hiển thị)" },
    { key: "description", placeholder: "Mô tả" },
    { key: "ticketTypeId", placeholder: "ID loại vé (ticketTypeId)" },
    { key: "eventSlug", placeholder: "Slug sự kiện (eventSlug)" },
  ],
};
const DEFAULT_ITEM_FIELDS: ItemFieldDef[] = [
  { key: "icon", placeholder: "Icon" },
  { key: "title", placeholder: "Tiêu đề" },
  { key: "description", placeholder: "Mô tả" },
];

function ItemsEditor({
  componentType,
  items,
  onChange,
}: {
  componentType: string;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
}) {
  const defs = ITEM_FIELDS[componentType] ?? DEFAULT_ITEM_FIELDS;

  function addItem() {
    onChange([...items, {}]);
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function updateItem(index: number, key: string, value: unknown) {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-[var(--konnit-pink-03)] p-2">
          <div className="flex-1 space-y-1">
            {defs.map((def) => {
              if (def.kind === "csv") {
                const arr = (item[def.key] as string[] | undefined) ?? [];
                return (
                  <Input
                    key={def.key}
                    placeholder={def.placeholder}
                    value={Array.isArray(arr) ? arr.join(", ") : ""}
                    onChange={(e) =>
                      updateItem(
                        i,
                        def.key,
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                );
              }
              if (def.kind === "facts") {
                const facts = (item[def.key] as { label?: string; value?: string }[] | undefined) ?? [];
                const text = Array.isArray(facts)
                  ? facts.map((f) => `${f.label ?? ""} | ${f.value ?? ""}`).join("\n")
                  : "";
                return (
                  <Textarea
                    key={def.key}
                    placeholder={def.placeholder}
                    rows={4}
                    value={text}
                    onChange={(e) =>
                      updateItem(
                        i,
                        def.key,
                        e.target.value
                          .split("\n")
                          .map((line) => line.split("|"))
                          .filter((p) => p[0]?.trim())
                          .map((p) => ({ label: p[0]?.trim(), value: p[1]?.trim() ?? "" })),
                      )
                    }
                  />
                );
              }
              return (
                <Input
                  key={def.key}
                  placeholder={def.placeholder}
                  value={(item[def.key] as string) ?? ""}
                  onChange={(e) => updateItem(i, def.key, e.target.value)}
                />
              );
            })}
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
