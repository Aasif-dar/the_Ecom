"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { ChartColumn, Table2 } from "lucide-react";
import type { AdminAnalytics, TimePoint } from "@/types";
import { CAT, CHART } from "@/lib/chart-colors";
import { formatINR, formatINRCompact, formatNumber } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/order-meta";
import { cn } from "@/lib/utils";

export type Period = "daily" | "weekly" | "monthly" | "yearly";
export const PERIODS: { id: Period; label: string; note: string }[] = [
  { id: "daily", label: "Daily", note: "Last 30 days" },
  { id: "weekly", label: "Weekly", note: "Last 12 weeks" },
  { id: "monthly", label: "Monthly", note: "Last 12 months" },
  { id: "yearly", label: "Yearly", note: "By financial year" },
];

export function seriesFor(a: AdminAnalytics, p: Period): TimePoint[] {
  return p === "daily" ? a.revenueDaily : p === "weekly" ? a.revenueWeekly : p === "monthly" ? a.revenueMonthly : a.revenueYearly;
}

const axisTick = { fill: CHART.axis, fontSize: 11 } as const;

function ChartTooltip({ active, payload, label, money }: Partial<TooltipContentProps<number, string>> & { money?: string[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 border border-line bg-paper-2 px-3.5 py-2.5 shadow-[0_12px_30px_-12px_rgba(20,17,15,0.35)]">
      <p className="mb-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-stone">{label}</p>
      <ul className="space-y-1">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center justify-between gap-5 text-[0.8125rem]">
            <span className="flex items-center gap-2 text-graphite">
              <span className="size-2 rounded-full" style={{ background: p.color ?? (p.payload as { fill?: string })?.fill }} />
              {p.name}
            </span>
            <span className="font-medium tabular-nums text-ink">{money?.includes(String(p.dataKey)) ? formatINR(Number(p.value)) : formatNumber(Number(p.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Card with a chart/table switch so every chart has an accessible, data-first view. */
export function ChartCard({
  title,
  description,
  controls,
  table,
  className,
  children,
}: {
  title: string;
  description?: string;
  controls?: React.ReactNode;
  table: { headers: string[]; rows: (string | number)[][] };
  className?: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <section className={cn("flex flex-col border border-line bg-paper-2", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-serif text-[1.45rem] leading-none">{title}</h2>
          {description && <p className="mt-1.5 text-[0.78rem] text-stone">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {controls}
          <div role="group" aria-label="Chart or table view" className="flex border border-line">
            {([
              ["chart", ChartColumn, "Chart"],
              ["table", Table2, "Table"],
            ] as const).map(([id, Icon, label]) => (
              <button key={id} type="button" aria-pressed={view === id} aria-label={`${label} view`} onClick={() => setView(id)} className={cn("grid size-8 place-items-center transition-colors", view === id ? "bg-ink text-paper" : "hover:bg-bone")}>
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="flex-1 px-3 pb-4 pt-5 sm:px-5">
        {view === "chart" ? (
          children
        ) : (
          <div className="thin-scroll max-h-72 overflow-auto">
            <table className="w-full text-left text-[0.8125rem]">
              <thead className="sticky top-0 bg-paper-2">
                <tr className="border-b border-ink">
                  {table.headers.map((h) => (
                    <th key={h} scope="col" className="px-2 py-2 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-stone">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line/70">
                    {r.map((c, j) => (
                      <td key={j} className={cn("px-2 py-2", j > 0 && "tabular-nums")}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export function PeriodSwitch({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div role="tablist" aria-label="Time range" className="flex border border-line">
      {PERIODS.map((p) => (
        <button key={p.id} type="button" role="tab" aria-selected={value === p.id} onClick={() => onChange(p.id)} className={cn("px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] transition-colors", value === p.id ? "bg-ink text-paper" : "hover:bg-bone")}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function RevenueChart({ data, height = 280 }: { data: TimePoint[]; height?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <div style={{ height }} role="img" aria-label="Revenue over time. Switch to table view for the figures.">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`rev-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.clay} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CHART.clay} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={52} tickCount={5} tickFormatter={(v) => formatINRCompact(Number(v))} />
          <Tooltip content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} money={["revenue"]} />} cursor={{ stroke: CHART.ink, strokeWidth: 1 }} />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke={CHART.clay} strokeWidth={2} fill={`url(#rev-${id})`} activeDot={{ r: 5, fill: CHART.clay, stroke: CHART.surface, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data, height = 280 }: { data: TimePoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Orders over time. Switch to table view for the figures.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={36} tickCount={5} allowDecimals={false} />
          <Tooltip content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} />} cursor={{ fill: "rgba(20,17,15,0.05)" }} />
          <Bar isAnimationActive={false} dataKey="orders" name="Orders" fill={CHART.ink} radius={[3, 3, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal bars: identity is carried by the axis labels, so a single hue is enough. */
export function CategoryChart({ data, height = 260 }: { data: AdminAnalytics["salesByCategory"]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Sales by category. Switch to table view for the figures.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 8 }} barCategoryGap="32%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ ...axisTick, fill: CHART.ink, fontSize: 12 }} tickLine={false} axisLine={false} width={92} />
          <Tooltip content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} money={["revenue"]} />} cursor={{ fill: "rgba(20,17,15,0.05)" }} />
          <Bar isAnimationActive={false} dataKey="revenue" name="Revenue" radius={[0, 3, 3, 0]} maxBarSize={22} label={{ position: "right", fill: CHART.ink, fontSize: 12, formatter: (v: unknown) => formatINRCompact(Number(v)) }}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={i === 0 ? CHART.clay : CHART.ink} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomerGrowthChart({ data, height = 260 }: { data: AdminAnalytics["customerGrowth"]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="New and returning customers by month. Switch to table view for the figures.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={20} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={30} tickCount={5} allowDecimals={false} />
          <Tooltip content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} />} cursor={{ fill: "rgba(20,17,15,0.05)" }} />
          <Legend verticalAlign="top" align="left" iconType="circle" iconSize={8} wrapperStyle={{ paddingBottom: 12, fontSize: 12, color: CHART.ink }} />
          <Bar isAnimationActive={false} dataKey="newCustomers" name="New" stackId="c" fill={CAT[0]} stroke={CHART.surface} strokeWidth={2} maxBarSize={24} />
          <Bar isAnimationActive={false} dataKey="returning" name="Returning" stackId="c" fill={CAT[1]} stroke={CHART.surface} strokeWidth={2} radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusChart({ data, height = 260 }: { data: AdminAnalytics["orderStatus"]; height?: number }) {
  const rows = data.map((d) => ({ name: ORDER_STATUS_META[d.status].label, count: d.count, status: d.status })).sort((a, b) => b.count - a.count);
  return (
    <div style={{ height }} role="img" aria-label="Orders by status. Switch to table view for the figures.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 8 }} barCategoryGap="30%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tick={{ ...axisTick, fill: CHART.ink, fontSize: 12 }} tickLine={false} axisLine={false} width={104} />
          <Tooltip content={(p) => <ChartTooltip {...(p as TooltipContentProps<number, string>)} />} cursor={{ fill: "rgba(20,17,15,0.05)" }} />
          <Bar isAnimationActive={false} dataKey="count" name="Orders" radius={[0, 3, 3, 0]} maxBarSize={20} label={{ position: "right", fill: CHART.ink, fontSize: 12 }}>
            {rows.map((r) => (
              <Cell key={r.status} fill={r.status === "cancelled" ? "#8A8174" : r.status === "delivered" ? CHART.ink : CHART.clay} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProducts({ data, limit = 6 }: { data: AdminAnalytics["topProducts"]; limit?: number }) {
  const rows = data.slice(0, limit);
  const max = Math.max(...rows.map((r) => r.units), 1);
  return (
    <ol className="space-y-3.5">
      {rows.map((p, i) => (
        <li key={p.productId} className="flex items-center gap-3.5">
          <span className="w-4 text-right text-[0.75rem] tabular-nums text-stone">{i + 1}</span>
          <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-bone">
            {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[0.8125rem]">{p.name}</p>
              <p className="shrink-0 text-[0.8125rem] font-medium tabular-nums">{p.units} <span className="font-normal text-stone">sold</span></p>
            </div>
            <div className="mt-1.5 h-[3px] bg-sand" aria-hidden>
              <div className="h-full bg-ink" style={{ width: `${(p.units / max) * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
