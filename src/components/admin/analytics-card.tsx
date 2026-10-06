import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHART } from "@/lib/chart-colors";

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const w = 112, h = 32, pad = 2;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), h - pad - ((v - min) / range) * (h - pad * 2)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={className} aria-hidden>
      <path d={d} fill="none" stroke={CHART.ink} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill={CHART.ink} stroke={CHART.surface} strokeWidth={2} />
    </svg>
  );
}

export function AnalyticsCard({
  label,
  value,
  delta,
  deltaLabel = "vs prior period",
  icon: Icon,
  spark,
  hint,
  alert,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  spark?: number[];
  hint?: string;
  alert?: boolean;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cn("flex flex-col justify-between border bg-paper-2 p-5", alert ? "border-clay/50" : "border-line")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone">{label}</p>
        <Icon className={cn("size-[1.1rem]", alert ? "text-clay" : "text-stone")} strokeWidth={1.3} aria-hidden />
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-serif text-[2.2rem] leading-none tabular-nums tracking-tight">{value}</p>
          {delta !== undefined ? (
            <p className={cn("mt-2.5 flex items-center gap-1 text-[0.75rem] tabular-nums", up ? "text-success" : "text-danger")}>
              {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              <span className="font-medium">{Math.abs(delta)}%</span>
              <span className="text-stone">{deltaLabel}</span>
            </p>
          ) : (
            hint && <p className="mt-2.5 text-[0.75rem] text-stone">{hint}</p>
          )}
        </div>
        {spark && <Sparkline data={spark} className="hidden shrink-0 sm:block" />}
      </div>
    </div>
  );
}
