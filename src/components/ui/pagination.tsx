"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function range(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const btn = "grid size-10 place-items-center text-[0.8125rem] tabular-nums transition-colors";
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1", className)}>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)} className={cn(btn, "hover:bg-bone disabled:opacity-30")}>
        <ChevronLeft className="size-4" />
      </button>
      {range(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="grid size-10 place-items-center text-stone">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            onClick={() => onChange(p)}
            className={cn(btn, p === page ? "border border-ink bg-ink text-paper" : "hover:bg-bone")}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className={cn(btn, "hover:bg-bone disabled:opacity-30")}>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
