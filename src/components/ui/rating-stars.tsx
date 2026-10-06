"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

const STAR = "M12 2.6l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8L12 2.6z";

function Star({ fill, size, id }: { fill: number; size: number; id: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={STAR} fill={`url(#${id})`} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function RatingStars({
  value,
  size = 14,
  className,
  showValue = false,
  count,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-ink", className)}
      role="img"
      aria-label={`Rated ${value.toFixed(1)} out of 5${count !== undefined ? ` from ${count} reviews` : ""}`}
    >
      <span className="inline-flex gap-px">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} id={`${uid}-${i}`} size={size} fill={Math.max(0, Math.min(1, value - i))} />
        ))}
      </span>
      {showValue && <span className="text-[0.8125rem] font-medium tabular-nums">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-[0.8125rem] text-stone tabular-nums">({count})</span>}
    </span>
  );
}

export function RatingInput({ value, onChange, size = 28 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Your rating" className="inline-flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="p-0.5 text-ink outline-offset-2 transition-transform hover:scale-110 focus-visible:outline-2"
          >
            <Star id={`ri-${n}`} size={size} fill={n <= active ? 1 : 0} />
          </button>
        ))}
      </div>
      <span className="eyebrow text-stone">{labels[active] ?? ""}</span>
    </div>
  );
}
