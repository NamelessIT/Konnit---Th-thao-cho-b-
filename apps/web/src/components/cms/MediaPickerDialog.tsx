"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFetch } from "@/hooks/useCmsData";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

interface UploadRecord {
  id: number;
  original_name: string;
  mime_type: string;
  path: string;
}

function fileUrl(path: string) {
  return `${BASE_URL}/${path}`;
}

interface Props {
  onSelect: (url: string) => void;
}

export function MediaPickerDialog({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const { data: files, loading } = useFetch<UploadRecord[]>(
    open ? "/admin/uploads" : null,
  );

  function handleSelect(path: string) {
    onSelect(fileUrl(path));
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button type="button" variant="outline" size="sm">
          <ImageIcon className="mr-1.5 size-4" />
          Chọn từ Media
        </Button>
      } />

      <DialogContent className="max-h-[80vh] w-full max-w-3xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn ảnh từ Media Library</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          )}

          {!loading && (!files || files.filter((f) => f.mime_type.startsWith("image/")).length === 0) && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Chưa có ảnh nào trong Media Library.
            </p>
          )}

          {!loading && files && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {files
                .filter((f) => f.mime_type.startsWith("image/"))
                .map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelect(f.path)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-(--konnit-pink-03) bg-(--konnit-pink-01) transition hover:border-(--konnit-berry) hover:ring-2 hover:ring-(--konnit-berry)/30 focus:outline-none focus:ring-2 focus:ring-(--konnit-berry)"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fileUrl(f.path)}
                      alt={f.original_name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-[10px] text-white">{f.original_name}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
