"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { useFetch } from "@/hooks/useCmsData";
import { formatVND } from "@/lib/shop/format";
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
  eyebrow: "Nhãn nhỏ phía trên (eyebrow)",
  subtitle: "Phụ đề",
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
  qrData: "QR — nội dung/link để tạo mã quét",
  qrImage: "QR — ảnh có sẵn (URL)",
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

  const liveTitle = useDebounce(title, 300);
  const liveDescription = useDebounce(description, 300);
  const debouncedContent = useDebounce(contentJson, 300);

  useEffect(() => {
    onLiveChange?.({
      title: liveTitle,
      description: liveDescription,
      contentJson: debouncedContent,
    });
  }, [liveTitle, liveDescription, debouncedContent, onLiveChange]);

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
            ) : field === "image" || field === "qrImage" ? (
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
            ) : field === "logos" ? (
              <LogosEditor
                logos={(contentJson.logos as Record<string, unknown>[] | undefined) ?? []}
                onChange={(logos) => updateField("logos", logos)}
              />
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
    hero: ["eyebrow", "title", "subtitle", "description", "content", "note", "image", "primaryCta", "secondaryCta"],
    rich_text: ["eyebrow", "title", "description", "content", "note"],
    image_text: ["eyebrow", "title", "description", "content", "note", "image", "imagePosition"],
    feature_grid: ["eyebrow", "title", "description", "items"],
    schedule: ["eyebrow", "title", "description", "items"],
    faq: ["eyebrow", "title", "description", "items"],
    cta: ["eyebrow", "title", "description", "buttonLabel", "buttonUrl", "note"],
    sponsor: ["title", "description", "logos"],
    note_alert: ["title", "description", "content", "note", "tone"],
    ticket_preview: ["eyebrow", "title", "description", "items", "note"],
    product: ["eyebrow", "title", "description", "items"],
    contact_panel: ["eyebrow", "label", "title", "description", "phone", "qrData", "qrImage", "primaryCta", "secondaryCta"],
    flow_steps: ["eyebrow", "title", "description", "items"],
  };
  return map[type] ?? ["title", "description", "content"];
}

type ItemFieldKind = "text" | "csv" | "facts" | "ticketType";
interface ItemFieldDef { key: string; placeholder: string; kind?: ItemFieldKind }

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
  schedule: [
    { key: "time", placeholder: "Thời gian (vd 08:00 hoặc Ngày 1)" },
    { key: "title", placeholder: "Hoạt động" },
    { key: "description", placeholder: "Chi tiết" },
  ],
  faq: [
    { key: "title", placeholder: "Câu hỏi" },
    { key: "description", placeholder: "Trả lời" },
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
    { key: "ticketTypeId", placeholder: "Chọn loại vé", kind: "ticketType" },
    { key: "title", placeholder: "Tiêu đề (tự điền khi chọn vé)" },
    { key: "price", placeholder: "Giá hiển thị (tự điền)" },
    { key: "description", placeholder: "Mô tả" },
  ],
};
const DEFAULT_ITEM_FIELDS: ItemFieldDef[] = [
  { key: "icon", placeholder: "Icon" },
  { key: "title", placeholder: "Tiêu đề" },
  { key: "description", placeholder: "Mô tả" },
];

type TicketTypeLite = {
  id: number;
  name: string;
  price: number | string;
  description?: string | null;
};

const selectCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-[var(--konnit-berry)] focus:ring-2 focus:ring-[var(--konnit-berry)]/20";

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
  const needsTickets = defs.some((d) => d.kind === "ticketType");
  const ttQ = useFetch<TicketTypeLite[]>(needsTickets ? "/admin/ticket-types" : null);
  const ticketTypes = ttQ.data ?? [];

  function addItem() {
    onChange([...items, {}]);
  }
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function moveItem(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const updated = [...items];
    [updated[index], updated[j]] = [updated[j], updated[index]];
    onChange(updated);
  }
  function updateItem(index: number, key: string, value: unknown) {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  }
  function updateItemMany(index: number, patch: Record<string, unknown>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-[var(--konnit-pink-03)] p-2">
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-center text-[10px] font-bold text-[var(--konnit-muted)]">#{i + 1}</span>
            <button
              type="button"
              onClick={() => moveItem(i, -1)}
              className="text-xs text-[var(--konnit-muted)] hover:text-[var(--konnit-berry)] disabled:opacity-30"
              disabled={i === 0}
              title="Lên"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveItem(i, 1)}
              className="text-xs text-[var(--konnit-muted)] hover:text-[var(--konnit-berry)] disabled:opacity-30"
              disabled={i === items.length - 1}
              title="Xuống"
            >
              ▼
            </button>
          </div>
          <div className="flex-1 space-y-1">
            {defs.map((def) => {
              if (def.kind === "ticketType") {
                const current = (item[def.key] as string) ?? "";
                return (
                  <div key={def.key} className="space-y-1">
                    <select
                      className={selectCls}
                      value={current}
                      onChange={(e) => {
                        const id = e.target.value;
                        const tt = ticketTypes.find((t) => String(t.id) === id);
                        const patch: Record<string, unknown> = { ticketTypeId: id };
                        if (tt) {
                          // Luôn ghi đè khi đổi loại vé
                          patch.title = tt.name;
                          patch.price = formatVND(Number(tt.price));
                          patch.description = tt.description ?? (item.description as string) ?? "";
                        }
                        updateItemMany(i, patch);
                      }}
                    >
                      <option value="">
                        {ttQ.loading ? "Đang tải loại vé…" : "— Chọn loại vé —"}
                      </option>
                      {ticketTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} · {formatVND(Number(t.price))} (#{t.id})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground">
                      {current
                        ? `Nút "Mua vé" sẽ mở /cua-hang#ticket-${current}`
                        : "Chọn loại vé để nút Mua vé nhảy đúng tới vé đó."}
                    </p>
                  </div>
                );
              }
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
          <Button variant="ghost" size="icon-xs" onClick={() => removeItem(i)} title="Xoá item">
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

function LogosEditor({
  logos,
  onChange,
}: {
  logos: Record<string, unknown>[];
  onChange: (logos: Record<string, unknown>[]) => void;
}) {
  function addLogo() {
    onChange([...logos, {}]);
  }
  function removeLogo(index: number) {
    onChange(logos.filter((_, i) => i !== index));
  }
  function updateLogo(index: number, key: string, value: unknown) {
    const updated = [...logos];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {logos.map((logo, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-[var(--konnit-pink-03)] p-2">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="URL ảnh logo (Sao chép từ Media) — bỏ trống để hiện tên"
              value={(logo.src as string) ?? ""}
              onChange={(e) => updateLogo(i, "src", e.target.value)}
            />
            <Input
              placeholder="Tên / alt (vd Nhà tài trợ A)"
              value={(logo.alt as string) ?? ""}
              onChange={(e) => updateLogo(i, "alt", e.target.value)}
            />
            {(logo.src as string) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.src as string}
                alt={(logo.alt as string) ?? "logo"}
                className="h-12 w-auto rounded border border-[var(--konnit-pink-03)] bg-white object-contain p-1"
              />
            ) : null}
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => removeLogo(i)} title="Xoá logo">
            ✕
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addLogo}>
        + Thêm logo
      </Button>
    </div>
  );
}