"use client";

import "@/components/cms-sections/registry";
import { cmsSectionRegistry } from "@konnit/ui";
import { UnsupportedSection } from "@/components/cms-sections/UnsupportedSection";

interface Section {
  id: number;
  component_type: string;
  style_variant: string;
  title: string | null;
  description: string | null;
  content_json: Record<string, unknown>;
  is_visible: boolean;
}

export interface LiveDraft {
  title: string;
  description: string;
  contentJson: Record<string, unknown>;
}

interface Props {
  sections: Section[];
  selectedId: number | null;
  draft: LiveDraft | null;
  onSelect: (id: number) => void;
}

export function LivePreview({ sections, selectedId, draft, onSelect }: Props) {
  if (sections.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--konnit-muted)]">
        Chưa có section nào — thêm section để xem trước.
      </div>
    );
  }

  return (
    <div className="bg-background">
      {sections.map((section) => {
        const isSelected = section.id === selectedId;
        // For the selected section, render from the live draft so edits show instantly.
        const content =
          isSelected && draft ? draft.contentJson : section.content_json;
        const title = isSelected && draft ? draft.title : section.title;
        const description =
          isSelected && draft ? draft.description : section.description;

        const entry = cmsSectionRegistry[section.component_type];
        const Component = entry?.styles[section.style_variant];

        return (
          <div
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={`relative cursor-pointer transition-all ${
              isSelected
                ? "ring-2 ring-inset ring-[var(--konnit-berry)]"
                : "hover:ring-2 hover:ring-inset hover:ring-[var(--konnit-pink-04)]"
            } ${section.is_visible ? "" : "opacity-40"}`}
          >
            {isSelected && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-[var(--konnit-berry)] px-2 py-0.5 text-xs font-medium text-white shadow">
                Đang chỉnh sửa
              </span>
            )}
            {!section.is_visible && (
              <span className="absolute right-2 top-2 z-10 rounded-full bg-[var(--konnit-ink)]/70 px-2 py-0.5 text-xs font-medium text-white">
                Đang ẩn
              </span>
            )}
            {Component ? (
              <Component
                contentJson={content}
                title={title}
                description={description}
              />
            ) : (
              <UnsupportedSection
                contentJson={content}
                title={title}
                description={description}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
