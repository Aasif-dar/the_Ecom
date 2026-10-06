"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

/** Single-open accordion with animated height; each header is a real button wired with aria-expanded. */
export function Accordion({ items, defaultOpen, className }: { items: AccordionItem[]; defaultOpen?: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const uid = useId();
  return (
    <div className={cn("border-t border-line", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `${uid}-${item.id}`;
        return (
          <div key={item.id} className="border-b border-line">
            <h3 className="font-sans">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between py-5 text-left text-[0.72rem] font-medium uppercase tracking-[0.16em]"
              >
                {item.title}
                <Plus className={cn("size-4 transition-transform duration-300", isOpen && "rotate-45")} />
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={undefined} className={cn("grid transition-[grid-template-rows] duration-400 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <div className="pb-6 text-[0.9375rem] leading-relaxed text-graphite">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
