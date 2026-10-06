"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function ProductGallery({ images, name, badge }: { images: string[]; name: string; badge?: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  };

  const goto = (i: number) => setActive((i + images.length) % images.length);
  const alt = (i: number) => `${name}, view ${i + 1} of ${images.length}`;

  return (
    <div className="relative">
      {/* Mobile: swipeable carousel */}
      <div className="md:hidden">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto"
          role="group"
          aria-roledescription="carousel"
          aria-label={`${name} photographs`}
        >
          {images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-bone" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${images.length}`}>
              <Image src={src} alt={alt(i)} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {badge && <div className="pointer-events-none absolute left-0 top-4">{badge}</div>}
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5" aria-hidden>
            {images.map((_, i) => (
              <span key={i} className={cn("h-0.5 transition-all duration-300", i === active ? "w-8 bg-ink" : "w-4 bg-sand")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbs + zoomable main image */}
      <div className="hidden gap-4 md:grid md:grid-cols-[76px_1fr] lg:grid-cols-[88px_1fr]">
        <div className="flex flex-col gap-3" role="tablist" aria-label="Product photographs">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show view ${i + 1}`}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn("relative aspect-[4/5] overflow-hidden bg-bone outline-offset-2 transition-opacity", i === active ? "ring-1 ring-ink ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100")}
            >
              <Image src={src} alt="" fill sizes="90px" className="object-cover" />
            </button>
          ))}
        </div>

        <div
          className="group/main relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-bone"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          onClick={() => setLightbox(true)}
        >
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={alt(i)}
              fill
              priority={i === 0}
              sizes="(min-width:1280px) 40vw, 55vw"
              className={cn("object-cover transition-opacity duration-500", i === active ? "opacity-100" : "opacity-0")}
              style={i === active && zoom ? { transform: "scale(2.1)", transformOrigin: `${zoom.x}% ${zoom.y}%`, transition: "transform 0.25s ease-out, opacity 0.5s" } : { transition: "transform 0.35s ease-out, opacity 0.5s" }}
            />
          ))}
          {badge && <div className="pointer-events-none absolute left-0 top-4">{badge}</div>}
          <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 bg-paper/90 px-3 py-1.5 text-[0.625rem] font-medium uppercase tracking-[0.14em] opacity-0 transition-opacity group-hover/main:opacity-100">
            <ZoomIn className="size-3.5" /> Click to enlarge
          </span>
        </div>
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="h-[94dvh] max-w-[min(94vw,1100px)] bg-ink p-0 sm:max-w-[min(94vw,1100px)]" showCloseButton>
          <DialogTitle className="sr-only">{name} photographs</DialogTitle>
          <div className="relative h-full w-full">
            <Image src={images[active]} alt={alt(active)} fill sizes="94vw" className="object-contain" />
            {images.length > 1 && (
              <>
                <button type="button" aria-label="Previous photograph" onClick={() => goto(active - 1)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center bg-paper/90 hover:bg-paper">
                  <ChevronLeft className="size-5" />
                </button>
                <button type="button" aria-label="Next photograph" onClick={() => goto(active + 1)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center bg-paper/90 hover:bg-paper">
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
