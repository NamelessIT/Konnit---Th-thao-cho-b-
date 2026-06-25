"use client";

import { useState, useCallback, use } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Eye, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/cms/SectionCard";
import { SectionEditor } from "@/components/cms/SectionEditor";
import { LivePreview, type LiveDraft } from "@/components/cms/LivePreview";
import { AddSectionDialog } from "@/components/cms/AddSectionDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useFetch } from "@/hooks/useCmsData";
import { api } from "@/lib/api-client";

interface Section {
  id: number;
  component_type: string;
  style_variant: string;
  title: string | null;
  description: string | null;
  content_json: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
}

interface PageData {
  id: number;
  title: string;
  slug: string;
  status: string;
  category_name: string;
  category_slug: string;
  sections: Section[];
}

export default function PageBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: page, loading, refetch } = useFetch<PageData>(`/admin/cms/pages/${id}/full`);

  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [liveDraft, setLiveDraft] = useState<LiveDraft | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLiveChange = useCallback((draft: LiveDraft) => {
    setLiveDraft(draft);
  }, []);

  function selectSection(sectionId: number) {
    setLiveDraft(null);
    setSelectedSectionId(sectionId);
  }

  const sections = page?.sections ?? [];
  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex);

      try {
        await api.put(
          "/admin/cms/sections/reorder",
          reordered.map((s, i) => ({ id: s.id, sortOrder: i })),
        );
        refetch();
      } catch {
        toast.error("Sắp xếp thất bại");
      }
    },
    [sections, refetch],
  );

  async function handleAddSection(
    templateId: number,
    styleId: number,
    typeKey: string,
    styleKey: string,
  ) {
    try {
      await api.post(`/admin/cms/pages/${id}/sections`, {
        templateId,
        styleId,
        componentType: typeKey,
        styleVariant: styleKey,
      });
      toast.success("Đã thêm section");
      refetch();
    } catch {
      toast.error("Thêm section thất bại");
    }
  }

  async function handleDuplicate(sectionId: number) {
    try {
      await api.post(`/admin/cms/sections/${sectionId}/duplicate`);
      toast.success("Đã nhân bản section");
      refetch();
    } catch {
      toast.error("Nhân bản thất bại");
    }
  }

  async function handleToggleVisible(sectionId: number) {
    try {
      await api.post(`/admin/cms/sections/${sectionId}/toggle-visible`);
      refetch();
    } catch {
      toast.error("Cập nhật thất bại");
    }
  }

  async function handleDeleteSection() {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/cms/sections/${deleteId}`);
      if (selectedSectionId === deleteId) setSelectedSectionId(null);
      setDeleteId(null);
      toast.success("Đã xóa section");
      refetch();
    } catch {
      toast.error("Xóa thất bại");
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      await api.post(`/admin/cms/pages/${id}/publish`);
      toast.success("Đã publish trang");
      refetch();
    } catch {
      toast.error("Publish thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!page) return <p className="text-destructive">Không tìm thấy trang</p>;

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold">{page.title}</h1>
          <Badge variant={page.status === "published" ? "default" : "secondary"}>
            {page.status}
          </Badge>
          <span className="text-xs text-muted-foreground">{page.category_name}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/c/${page.category_slug}/${page.slug}`, "_blank")}>
            <Eye className="size-4" /> Xem trang thật
          </Button>
          <Button size="sm" onClick={handlePublish} disabled={saving} className="bg-[var(--konnit-berry)] text-white">
            <Rocket className="size-4" /> {page.status === "published" ? "Re-publish" : "Publish"}
          </Button>
        </div>
      </div>

      {/* 3-column: section list · live preview · editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left rail: section structure */}
        <div className="w-64 shrink-0 overflow-auto border-r bg-card p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--konnit-muted)]">
            Cấu trúc trang
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isActive={section.id === selectedSectionId}
                    onClick={() => selectSection(section.id)}
                    onDuplicate={() => handleDuplicate(section.id)}
                    onToggleVisible={() => handleToggleVisible(section.id)}
                    onDelete={() => setDeleteId(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            variant="outline"
            className="mt-3 w-full border-dashed"
            onClick={() => setAddDialogOpen(true)}
          >
            + Thêm section
          </Button>
        </div>

        {/* Center: live WYSIWYG preview */}
        <div className="flex-1 overflow-auto bg-[var(--konnit-pink-01)]">
          <LivePreview
            sections={sections}
            selectedId={selectedSectionId}
            draft={liveDraft}
            onSelect={selectSection}
          />
        </div>

        {/* Right editor panel */}
        {selectedSection && (
          <ScrollArea className="w-80 shrink-0 border-l bg-card">
            <div className="p-4">
              <SectionEditor
                key={selectedSection.id}
                section={selectedSection}
                onUpdated={refetch}
                onLiveChange={handleLiveChange}
              />
            </div>
          </ScrollArea>
        )}
      </div>

      <AddSectionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSelect={handleAddSection}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa section?"
        description="Section sẽ bị xóa khỏi trang này."
        confirmLabel="Xóa"
        variant="destructive"
        onConfirm={handleDeleteSection}
      />
    </div>
  );
}
