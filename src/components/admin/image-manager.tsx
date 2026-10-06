"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Images, Link2, Star, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PRODUCT_IMAGE_COUNT } from "@/data/image-manifest";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 8;

/** Downscales an uploaded file to a JPEG data URL so the demo can persist it in localStorage. */
async function fileToDataUrl(file: File, maxEdge = 900, quality = 0.78): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

const LIBRARY = Object.entries(PRODUCT_IMAGE_COUNT).flatMap(([slug, n]) => Array.from({ length: n }, (_, i) => `/images/products/${slug}-${i + 1}.jpg`));

export function ImageManager({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [libSel, setLibSel] = useState<string[]>([]);
  const [url, setUrl] = useState("");

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = [...files].filter((f) => f.type.startsWith("image/"));
      if (!list.length) return toast.error("Please choose image files (JPG, PNG or WebP).");
      const room = MAX_IMAGES - value.length;
      if (room <= 0) return toast.error(`You can add up to ${MAX_IMAGES} images.`);
      setBusy(true);
      try {
        const urls = await Promise.all(list.slice(0, room).map((f) => fileToDataUrl(f)));
        onChange([...value, ...urls]);
        toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} added`);
        if (list.length > room) toast.warning(`Only ${room} fit. The limit is ${MAX_IMAGES} images.`);
      } catch {
        toast.error("Couldn't read one of those files.");
      } finally {
        setBusy(false);
      }
    },
    [value, onChange],
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDragOver(true);
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (e.dataTransfer.files?.length) {
            e.preventDefault();
            setDragOver(false);
            void addFiles(e.dataTransfer.files);
          }
        }}
        className={cn("border border-dashed p-6 text-center transition-colors", dragOver ? "border-ink bg-bone" : "border-stone/50 bg-paper")}
      >
        <UploadCloud className="mx-auto size-8 text-stone" strokeWidth={1.2} />
        <p className="mt-3 text-[0.9rem]">
          Drag and drop images here, or{" "}
          <button type="button" onClick={() => inputRef.current?.click()} className="font-medium underline underline-offset-4">
            browse files
          </button>
        </p>
        <p className="mt-1 text-[0.78rem] text-stone">JPG, PNG or WebP · up to {MAX_IMAGES} images · the first is the primary image</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
            <UploadCloud className="size-3.5" /> {busy ? "Processing…" : "Upload"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => { setLibSel([]); setLibOpen(true); }}>
            <Images className="size-3.5" /> Media library
          </Button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-[0.8125rem] text-danger">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Product images. Drag to reorder.">
          {value.map((src, i) => (
            <li
              key={`${src.slice(-40)}-${i}`}
              draggable
              onDragStart={(e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(i));
              }}
              onDragOver={(e) => {
                if (dragIndex !== null) {
                  e.preventDefault();
                  setOverIndex(i);
                }
              }}
              onDrop={(e) => {
                if (dragIndex !== null) {
                  e.preventDefault();
                  move(dragIndex, i);
                }
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn("group relative cursor-grab bg-bone active:cursor-grabbing", overIndex === i && dragIndex !== i && "ring-2 ring-clay ring-offset-2 ring-offset-paper", dragIndex === i && "opacity-40")}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* data: and relative URLs both render via next/image with unoptimized for data URIs */}
                <Image src={src} alt={`Product image ${i + 1}`} fill sizes="200px" unoptimized={src.startsWith("data:") || src.startsWith("http")} className="object-cover" draggable={false} />
                {i === 0 && <span className="absolute left-0 top-2 bg-ink px-2 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-paper">Primary</span>}
              </div>
              <div className="flex items-center justify-between border-t border-line bg-paper-2 px-1 py-1">
                <div className="flex">
                  <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, i - 1)} className="grid size-7 place-items-center hover:bg-bone disabled:opacity-30">
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button type="button" aria-label="Move later" disabled={i === value.length - 1} onClick={() => move(i, i + 1)} className="grid size-7 place-items-center hover:bg-bone disabled:opacity-30">
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
                <div className="flex">
                  <button type="button" aria-label="Set as primary image" disabled={i === 0} onClick={() => move(i, 0)} title="Set as primary" className="grid size-7 place-items-center hover:bg-bone disabled:opacity-30">
                    <Star className="size-3.5" />
                  </button>
                  <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-7 place-items-center hover:bg-bone hover:text-danger">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={libOpen}
        onOpenChange={setLibOpen}
        variant="drawer"
        title="Media library"
        description="Pick from existing studio photography, or add an image by URL."
        footer={
          <>
            <Button variant="ghost" onClick={() => setLibOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!libSel.length}
              onClick={() => {
                const room = MAX_IMAGES - value.length;
                onChange([...value, ...libSel.filter((s) => !value.includes(s)).slice(0, room)]);
                setLibOpen(false);
              }}
            >
              Add {libSel.length || ""} selected
            </Button>
          </>
        }
      >
        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^https?:\/\/.+/i.test(url)) return toast.error("Enter a full image URL starting with https://");
            onChange([...value, url]);
            setUrl("");
            setLibOpen(false);
          }}
        >
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… image URL" className="pl-9" aria-label="Image URL" />
          </div>
          <Button type="submit" variant="outline">
            Add URL
          </Button>
        </form>
        <ul className="grid grid-cols-3 gap-2">
          {LIBRARY.map((src) => {
            const on = libSel.includes(src);
            return (
              <li key={src}>
                <button type="button" aria-pressed={on} onClick={() => setLibSel((s) => (on ? s.filter((x) => x !== src) : [...s, src]))} className={cn("relative block aspect-[4/5] w-full overflow-hidden bg-bone", on && "ring-2 ring-ink ring-offset-2 ring-offset-paper")}>
                  <Image src={src} alt="" fill sizes="120px" loading="lazy" className="object-cover" />
                  {on && <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-ink text-paper"><X className="size-3 rotate-45" /></span>}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
