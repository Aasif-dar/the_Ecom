"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const EDITORIAL_IMAGES = [
  "hero-main", "hero-side", "cat-women", "cat-men", "cat-accessories", "cat-footwear", "cat-new", "cat-best", "promo", "story-main", "story-side",
  "lookbook-utsav", "lookbook-denim", "lookbook-tailoring", "lookbook-weekend", "auth", "rail", "rail-2",
].map((n) => `/images/editorial/${n}.jpg`);

async function toDataUrl(file: File, maxEdge = 1400, q = 0.8) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}

/** Single-image chooser: studio library, upload (stored as a downscaled data URL) or pasted URL. */
export function ImagePicker({ value, onChange, aspect = "aspect-[4/5]", label }: { value: string; onChange: (v: string) => void; aspect?: string; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  return (
    <div>
      <div className="flex gap-4">
        <div className={cn("relative w-28 shrink-0 overflow-hidden bg-bone sm:w-36", aspect)}>
          {value ? <Image src={value} alt={label} fill sizes="150px" unoptimized={value.startsWith("data:") || value.startsWith("http")} className="object-cover" /> : <span className="grid h-full place-items-center text-stone"><ImagePlus className="size-6" strokeWidth={1.2} /></span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()}>
              <UploadCloud className="size-3.5" /> Upload
            </Button>
            <input
              ref={ref}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  onChange(await toDataUrl(f));
                } catch {
                  toast.error("Couldn't read that file.");
                }
                e.target.value = "";
              }}
            />
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^https?:\/\/.+/i.test(url)) return toast.error("Enter a full URL starting with https://");
              onChange(url);
              setUrl("");
            }}
          >
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL" aria-label={`${label} URL`} className="h-9 text-[0.8125rem]" />
            <Button type="submit" size="sm" variant="outline">
              Use
            </Button>
          </form>
        </div>
      </div>
      <p className="mb-2 mt-4 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-stone">Studio library</p>
      <ul className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        {EDITORIAL_IMAGES.map((src) => (
          <li key={src} className="shrink-0">
            <button type="button" aria-label={`Use ${src.split("/").pop()}`} aria-pressed={value === src} onClick={() => onChange(src)} className={cn("relative block h-16 w-12 overflow-hidden bg-bone", value === src && "ring-2 ring-ink ring-offset-2 ring-offset-paper")}>
              <Image src={src} alt="" fill sizes="48px" loading="lazy" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
