"use client";

import { useState } from "react";
import { Check, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/hooks/useCmsData";

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

interface SingleProps {
  multiple?: false;
  onSelect: (url: string) => void;
  selectedUrls?: never;
  onSelectMultiple?: never;
  maxSelections?: never;
}

interface MultipleProps {
  multiple: true;
  selectedUrls: string[];
  onSelectMultiple: (urls: string[]) => void;
  onSelect?: never;
  maxSelections?: number;
}

type Props = SingleProps | MultipleProps;

export function MediaPickerDialog(props: Props) {
  const [open, setOpen] = useState(false);
  const [pendingUrls, setPendingUrls] = useState<string[]>([]);
  const { data: files, loading } = useFetch<UploadRecord[]>(
    open ? "/admin/uploads" : null,
  );
  const maxSelections = props.multiple ? (props.maxSelections ?? 3) : 1;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && props.multiple) {
      setPendingUrls([...new Set(props.selectedUrls)].slice(0, maxSelections));
    }
    setOpen(nextOpen);
  }

  function handleSelect(path: string) {
    const url = fileUrl(path);
    if (!props.multiple) {
      props.onSelect(url);
      setOpen(false);
      return;
    }

    setPendingUrls((current) => {
      if (current.includes(url)) return current.filter((item) => item !== url);
      if (current.length >= maxSelections) {
        toast.warning(`Chỉ được chọn tối đa ${maxSelections} ảnh`);
        return current;
      }
      return [...current, url];
    });
  }

  function confirmMultiple() {
    if (!props.multiple) return;
    props.onSelectMultiple(pendingUrls);
    setOpen(false);
  }

  const images = files?.filter((file) => file.mime_type.startsWith("image/")) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm">
            <ImageIcon data-icon="inline-start" />
            Chọn từ Media
          </Button>
        }
      />

      <DialogContent className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Chọn ảnh từ Media Library</DialogTitle>
          <DialogDescription>
            {props.multiple
              ? `Chọn tối đa ${maxSelections} ảnh. Nhấn lại vào ảnh để bỏ chọn.`
              : "Chọn một ảnh đã tải lên."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-lg" />
              ))}
            </div>
          )}

          {!loading && images.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Chưa có ảnh nào trong Media Library.
            </p>
          )}

          {!loading && images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((file) => {
                const url = fileUrl(file.path);
                const selected = props.multiple && pendingUrls.includes(url);
                return (
                  <button
                    key={file.id}
                    type="button"
                    aria-pressed={props.multiple ? selected : undefined}
                    onClick={() => handleSelect(file.path)}
                    className={`group relative aspect-square overflow-hidden rounded-lg border bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected ? "border-primary ring-2 ring-primary" : "hover:border-primary"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={file.original_name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    {selected && (
                      <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check />
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1">
                      <p className="truncate text-[10px] text-white">{file.original_name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {props.multiple && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={confirmMultiple}>
              Xác nhận ({pendingUrls.length})
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
