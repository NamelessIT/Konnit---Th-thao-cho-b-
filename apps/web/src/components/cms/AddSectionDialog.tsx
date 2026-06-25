"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFetch } from "@/hooks/useCmsData";

interface Template {
  id: number;
  type_key: string;
  name: string;
  styles: { id: number; style_key: string; name: string }[];
}

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (templateId: number, styleId: number, typeKey: string, styleKey: string) => void;
}

export function AddSectionDialog({ open, onOpenChange, onSelect }: AddSectionDialogProps) {
  const { data: templates } = useFetch<Template[]>(open ? "/admin/cms/templates" : null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  function handleClose(o: boolean) {
    if (!o) setSelectedTemplate(null);
    onOpenChange(o);
  }

  function handleStyleSelect(style: Template["styles"][0]) {
    if (!selectedTemplate) return;
    onSelect(selectedTemplate.id, style.id, selectedTemplate.type_key, style.style_key);
    setSelectedTemplate(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedTemplate ? `Chọn kiểu — ${selectedTemplate.name}` : "Chọn loại section"}
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {templates?.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedTemplate(t)}
              >
                <CardContent className="p-4 text-center">
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.styles.length} kiểu
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTemplate && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 w-fit"
              onClick={() => setSelectedTemplate(null)}
            >
              ← Quay lại
            </Button>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedTemplate.styles.map((s) => (
                <Card
                  key={s.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleStyleSelect(s)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-sm">{s.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
