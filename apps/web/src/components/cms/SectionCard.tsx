"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Eye, EyeOff, Trash2 } from "lucide-react";

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
};
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Section {
  id: number;
  component_type: string;
  style_variant: string;
  title: string | null;
  is_visible: boolean;
}

interface SectionCardProps {
  section: Section;
  isActive: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
}

export function SectionCard({
  section,
  isActive,
  onClick,
  onDuplicate,
  onToggleVisible,
  onDelete,
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-pointer transition-colors ${
        isActive
          ? "border-(--konnit-berry) ring-1 ring-(--konnit-berry)"
          : "hover:border-(--konnit-pink-04)"
      } ${!section.is_visible ? "opacity-60" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="size-4" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {COMPONENT_LABELS[section.component_type] ?? section.component_type}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {section.style_variant}
            </Badge>
            {!section.is_visible && (
              <Badge variant="outline" className="text-[10px]">
                Ẩn
              </Badge>
            )}
          </div>
          {section.title && (
            <p className="text-sm truncate mt-0.5">{section.title}</p>
          )}
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-xs" onClick={onDuplicate} title="Nhân bản">
            <Copy className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onToggleVisible} title="Ẩn/hiện">
            {section.is_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDelete} title="Xóa" className="text-destructive">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
