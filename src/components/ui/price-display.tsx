import { cn } from "@/lib/utils";
import { discountPercent, formatINR } from "@/lib/format";

export function PriceDisplay({
  price,
  mrp,
  size = "md",
  showPercent = true,
  className,
}: {
  price: number;
  mrp?: number;
  size?: "sm" | "md" | "lg";
  showPercent?: boolean;
  className?: string;
}) {
  const pct = mrp ? discountPercent(price, mrp) : 0;
  const sizes = {
    sm: { price: "text-[0.875rem]", mrp: "text-[0.75rem]", pct: "text-[0.6875rem]" },
    md: { price: "text-[0.9375rem]", mrp: "text-[0.8125rem]", pct: "text-[0.75rem]" },
    lg: { price: "text-[1.6rem] font-serif tracking-tight", mrp: "text-base", pct: "text-[0.8125rem]" },
  }[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 tabular-nums", className)}>
      <span className={cn("font-medium text-ink", sizes.price)}>{formatINR(price)}</span>
      {pct > 0 && mrp && (
        <>
          <span className={cn("text-stone line-through decoration-stone/60", sizes.mrp)}>{formatINR(mrp)}</span>
          {showPercent && <span className={cn("font-medium text-clay", sizes.pct)}>{pct}% off</span>}
        </>
      )}
    </div>
  );
}
