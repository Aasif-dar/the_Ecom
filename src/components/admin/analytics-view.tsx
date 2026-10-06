"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { ChartCard, CategoryChart, CustomerGrowthChart, OrdersChart, PERIODS, PeriodSwitch, RevenueChart, StatusChart, TopProducts, seriesFor, type Period } from "@/components/admin/charts";
import { useAnalytics } from "@/hooks/use-analytics";
import { formatINR, formatINRCompact, formatNumber } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orders";

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "danger" | "success" | "clay" }) {
  return (
    <div className="border border-line bg-paper-2 p-5">
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone">{label}</p>
      <p className={cn("mt-3 font-serif text-[2.1rem] leading-none tabular-nums", tone === "danger" && "text-danger", tone === "success" && "text-success", tone === "clay" && "text-clay")}>{value}</p>
      {sub && <p className="mt-2 text-[0.75rem] text-stone">{sub}</p>}
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-ink pt-8">
      <div className="mb-6">
        <h2 id={`${id}-h`} className="font-serif text-[2rem] leading-none">{title}</h2>
        <p className="mt-2 text-[0.85rem] text-stone">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function AnalyticsView() {
  const a = useAnalytics();
  const orders = useOrderStore((s) => s.orders);
  const [period, setPeriod] = useState<Period>("monthly");
  const series = seriesFor(a, period);
  const note = PERIODS.find((p) => p.id === period)?.note;

  const totals = useMemo(() => series.reduce((acc, p) => ({ revenue: acc.revenue + p.revenue, orders: acc.orders + p.orders }), { revenue: 0, orders: 0 }), [series]);
  const counts = useMemo(() => {
    const c = { total: orders.length, completed: 0, pending: 0, cancelled: 0 };
    for (const o of orders) {
      if (o.status === "delivered") c.completed++;
      else if (o.status === "cancelled") c.cancelled++;
      else c.pending++;
    }
    return c;
  }, [orders]);

  const buyers = useMemo(() => {
    const per = new Map<string, number>();
    for (const o of orders) if (o.status !== "cancelled") per.set(o.userId, (per.get(o.userId) ?? 0) + 1);
    const repeat = [...per.values()].filter((n) => n > 1).length;
    return { buyers: per.size, repeat, rate: per.size ? Math.round((repeat / per.size) * 100) : 0 };
  }, [orders]);

  const returningShare = (() => {
    const last = a.customerGrowth.slice(-6);
    const ret = last.reduce((s, c) => s + c.returning, 0);
    const nw = last.reduce((s, c) => s + c.newCustomers, 0);
    return ret + nw ? Math.round((ret / (ret + nw)) * 100) : 0;
  })();

  return (
    <>
      <AdminPageHeader title="Analytics" description="Revenue, orders, customers, products and categories, derived live from store activity." />
      <nav aria-label="Jump to section" className="no-scrollbar -mx-4 mb-8 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {["Revenue", "Orders", "Customers", "Products", "Categories"].map((s) => (
          <a key={s} href={`#${s.toLowerCase()}`} className="shrink-0 border border-line bg-paper-2 px-4 py-2 text-[0.78rem] transition-colors hover:border-ink">
            {s}
          </a>
        ))}
      </nav>

      <div className="space-y-14">
        <Section id="revenue" title="Revenue" description={`${note} · net of GST, excluding cancelled orders`}>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Revenue in view" value={formatINRCompact(totals.revenue)} sub={formatINR(totals.revenue)} />
            <Stat label="Orders in view" value={formatNumber(totals.orders)} />
            <Stat label="Average order value" value={formatINR(a.totals.averageOrderValue)} sub="All time, incl. GST" />
          </div>
          <ChartCard title="Revenue" description={note} controls={<PeriodSwitch value={period} onChange={setPeriod} />} table={{ headers: ["Period", "Revenue", "Orders"], rows: series.map((p) => [p.label, formatINR(p.revenue), p.orders]) }}>
            <RevenueChart data={series} height={320} />
          </ChartCard>
        </Section>

        <Section id="orders" title="Orders" description="Everything placed on the store, by lifecycle stage.">
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Total orders" value={formatNumber(counts.total)} />
            <Stat label="Completed" value={formatNumber(counts.completed)} sub={`${counts.total ? Math.round((counts.completed / counts.total) * 100) : 0}% delivered`} tone="success" />
            <Stat label="Pending" value={formatNumber(counts.pending)} sub="Placed, packed or on the way" tone="clay" />
            <Stat label="Cancelled" value={formatNumber(counts.cancelled)} sub={`${counts.total ? Math.round((counts.cancelled / counts.total) * 100) : 0}% of orders`} tone="danger" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Orders over time" description={note} table={{ headers: ["Period", "Orders"], rows: series.map((p) => [p.label, p.orders]) }}>
              <OrdersChart data={series} />
            </ChartCard>
            <ChartCard title="Orders by status" description="Current pipeline" table={{ headers: ["Status", "Orders"], rows: a.orderStatus.map((s) => [ORDER_STATUS_META[s.status].label, s.count]) }}>
              <StatusChart data={a.orderStatus} />
            </ChartCard>
          </div>
        </Section>

        <Section id="customers" title="Customers" description="Who is shopping, and whether they come back.">
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Total customers" value={formatNumber(a.totals.customers)} />
            <Stat label="New (30 days)" value={formatNumber(a.totals.newCustomers30)} sub={`${a.totals.newCustomersTrend >= 0 ? "+" : ""}${a.totals.newCustomersTrend}% vs previous 30`} />
            <Stat label="Returning share" value={`${returningShare}%`} sub="Of active customers, last 6 months" />
            <Stat label="Repeat buyers" value={`${buyers.rate}%`} sub={`${buyers.repeat} of ${buyers.buyers} have ordered more than once`} />
          </div>
          <ChartCard title="New vs returning customers" description="Monthly, last 12 months" table={{ headers: ["Month", "New", "Returning"], rows: a.customerGrowth.map((c) => [c.label, c.newCustomers, c.returning]) }}>
            <CustomerGrowthChart data={a.customerGrowth} height={300} />
          </ChartCard>
        </Section>

        <Section id="products" title="Products" description="What's selling and what needs restocking.">
          <div className="grid gap-6 xl:grid-cols-3">
            <AdminCard className="p-5 sm:p-6">
              <h3 className="mb-5 font-serif text-[1.45rem] leading-none">Best sellers</h3>
              <TopProducts data={a.topProducts} limit={8} />
            </AdminCard>
            <AdminCard className="p-5 sm:p-6">
              <h3 className="mb-1 font-serif text-[1.45rem] leading-none">Low stock</h3>
              <p className="mb-5 text-[0.78rem] text-stone">{a.lowStock.length} products with 10 units or fewer</p>
              <ul className="max-h-[26rem] space-y-3 overflow-y-auto">
                {a.lowStock.map((p) => (
                  <li key={p.productId}>
                    <Link href={`/admin/products/${p.productId}`} className="group flex items-center gap-3">
                      <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-bone">
                        <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[0.8125rem] group-hover:text-clay">{p.name}</span>
                      <span className="shrink-0 text-[0.75rem] font-medium tabular-nums text-clay">{p.stock} left</span>
                    </Link>
                  </li>
                ))}
                {a.lowStock.length === 0 && <li className="text-[0.85rem] text-stone">No low-stock products.</li>}
              </ul>
            </AdminCard>
            <AdminCard className="p-5 sm:p-6">
              <h3 className="mb-1 font-serif text-[1.45rem] leading-none">Out of stock</h3>
              <p className="mb-5 text-[0.78rem] text-stone">{a.outOfStock.length} products unavailable</p>
              <ul className="max-h-[26rem] space-y-3 overflow-y-auto">
                {a.outOfStock.map((p) => (
                  <li key={p.productId}>
                    <Link href={`/admin/products/${p.productId}`} className="group flex items-center gap-3">
                      <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-bone">
                        <Image src={p.image} alt="" fill sizes="36px" className="object-cover opacity-60" />
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[0.8125rem] group-hover:text-clay">{p.name}</span>
                      <span className="shrink-0 text-[0.75rem] font-medium text-danger">Sold out</span>
                    </Link>
                  </li>
                ))}
                {a.outOfStock.length === 0 && <li className="text-[0.85rem] text-stone">Everything is in stock.</li>}
              </ul>
            </AdminCard>
          </div>
        </Section>

        <Section id="categories" title="Categories" description="Revenue and units by category, all time.">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <ChartCard title="Category sales comparison" description="Selling price × units" table={{ headers: ["Category", "Revenue", "Units"], rows: a.salesByCategory.map((c) => [c.name, formatINR(c.revenue), c.units]) }}>
              <CategoryChart data={a.salesByCategory} height={280} />
            </ChartCard>
            <AdminCard className="p-5 sm:p-6">
              <h3 className="mb-5 font-serif text-[1.45rem] leading-none">Share of revenue</h3>
              <ul className="space-y-4">
                {(() => {
                  const total = a.salesByCategory.reduce((s, c) => s + c.revenue, 0) || 1;
                  return a.salesByCategory.map((c) => (
                    <li key={c.name}>
                      <div className="mb-1.5 flex items-baseline justify-between text-[0.85rem]">
                        <span>{c.name}</span>
                        <span className="tabular-nums">
                          <strong className="font-medium">{Math.round((c.revenue / total) * 100)}%</strong> <span className="text-stone">· {c.units} units</span>
                        </span>
                      </div>
                      <div className="h-[3px] bg-sand" aria-hidden>
                        <div className="h-full bg-ink" style={{ width: `${(c.revenue / total) * 100}%` }} />
                      </div>
                    </li>
                  ));
                })()}
              </ul>
            </AdminCard>
          </div>
        </Section>
      </div>
    </>
  );
}
