import { Truck } from "lucide-react";
import { formatINR } from "@/lib/format";

export function ShippingProgress({ remaining, threshold }: { remaining: number; threshold: number }) {
  const pct = Math.min(100, Math.max(0, ((threshold - remaining) / threshold) * 100));
  const unlocked = remaining <= 0;
  return (
    <div className="bg-bone px-4 py-3.5">
      <p className="flex items-center gap-2 text-[0.8125rem] text-graphite">
        <Truck className="size-4 shrink-0" strokeWidth={1.5} />
        {unlocked ? (
          <span className="font-medium text-success">You've unlocked free shipping.</span>
        ) : (
          <span>
            Add <strong className="font-medium text-ink">{formatINR(remaining)}</strong> more for free shipping
          </span>
        )}
      </p>
      <div className="mt-2.5 h-[3px] w-full bg-sand" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
        <div className="h-full bg-ink transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
