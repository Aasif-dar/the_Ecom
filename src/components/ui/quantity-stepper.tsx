"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = "md",
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={cn("inline-flex items-stretch border border-line bg-paper-2", dim, className)} role="group" aria-label="Quantity">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn("grid place-items-center text-ink transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:opacity-35", size === "sm" ? "w-8" : "w-11")}
      >
        <Minus className="size-3.5" />
      </button>
      <span aria-live="polite" className={cn("grid min-w-8 place-items-center text-center text-sm font-medium tabular-nums", size === "sm" ? "w-7" : "w-10")}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn("grid place-items-center text-ink transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:opacity-35", size === "sm" ? "w-8" : "w-11")}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
