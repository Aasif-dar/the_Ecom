"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Boxes, Clock, IndianRupee, Plus, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { AnalyticsCard } from "@/components/admin/analytics-card";
import { ChartCard, CategoryChart, CustomerGrowthChart, OrdersChart, PERIODS, PeriodSwitch, RevenueChart, StatusChart, TopProducts, seriesFor, type Period } from "@/components/admin/charts";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { useAnalytics } from "@/hooks/use-analytics";
import { trendOf } from "@/lib/analytics";
import { formatDate, formatINR, formatINRCompact, formatNumber } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orders";
import { useAdminUser } from "@/store/hooks";

export function AdminOverview() {
  const a = useAnalytics();
  const admin = useAdminUser();
  const orders = useOrderStore((s) => s.orders);
  const [period, setPeriod] = useState<Period>("monthly");
  const series = seriesFor(a, period);
  const note = PERIODS.find((p) => p.id === period)?.note;

  const recent = useMemo(() => orders.slice(0, 7), [orders]);
  const revTrend = trendOf(a.revenueDaily.map((p) => p.revenue));
  const ordTrend = trendOf(a.revenueDaily.map((p) => p.orders));

  return (
    <>
      <AdminPageHeader
        title={`Welcome back, ${admin?.name.split(" ")[0] ?? "there"}`}
        description="Here's how the store is doing. Everything below updates live as customers shop and orders move."
        actions={
          <>
            <Link href="/admin/orders" className={buttonVariants({ variant: "outline" })}>
              Manage orders
            </Link>
            <Link href="/admin/products/new" className={buttonVariants()}>
              <Plus className="size-4" /> Add product
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 min-[540px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <AnalyticsCard label="Total sales" value={formatINRCompact(a.totals.sales)} icon={IndianRupee} delta={revTrend} deltaLabel="vs prior 14 days" spark={a.revenueDaily.slice(-14).map((p) => p.revenue)} />
        <AnalyticsCard label="Revenue (net of GST)" value={formatINRCompact(a.totals.revenue)} icon={TrendingUp} delta={revTrend} deltaLabel="vs prior 14 days" spark={a.revenueMonthly.map((p) => p.revenue)} />
        <AnalyticsCard label="Orders" value={formatNumber(a.totals.orders)} icon={ShoppingBag} delta={ordTrend} deltaLabel="vs prior 14 days" spark={a.revenueDaily.slice(-14).map((p) => p.orders)} />
        <AnalyticsCard label="Customers" value={formatNumber(a.totals.customers)} icon={Users} delta={a.totals.newCustomersTrend} deltaLabel="sign-ups, last 30 days" spark={a.customerGrowth.map((p) => p.newCustomers)} />
        <AnalyticsCard label="Products" value={formatNumber(a.totals.products)} icon={Boxes} hint={`${a.outOfStock.length} sold out · ${a.lowStock.length} low`} />
        <AnalyticsCard label="Pending orders" value={formatNumber(a.totals.pendingOrders)} icon={Clock} hint="Need packing or dispatch" alert={a.totals.pendingOrders > 0} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <ChartCard
          title="Revenue over time"
          description={`${note} · net of GST`}
          controls={<PeriodSwitch value={period} onChange={setPeriod} />}
          table={{ headers: ["Period", "Revenue", "Orders"], rows: series.map((p) => [p.label, formatINR(p.revenue), p.orders]) }}
        >
          <RevenueChart data={series} />
        </ChartCard>
        <AdminCard className="p-5 sm:p-6">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-serif text-[1.45rem] leading-none">Top selling</h2>
            <Link href="/admin/analytics" className="text-[0.72rem] uppercase tracking-[0.12em] text-stone hover:text-ink">
              Details
            </Link>
          </div>
          <TopProducts data={a.topProducts} limit={6} />
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Orders over time" description={`${note}`} table={{ headers: ["Period", "Orders"], rows: series.map((p) => [p.label, p.orders]) }}>
          <OrdersChart data={series} />
        </ChartCard>
        <ChartCard title="Sales by category" description="All time, selling price × units" table={{ headers: ["Category", "Revenue", "Units"], rows: a.salesByCategory.map((c) => [c.name, formatINR(c.revenue), c.units]) }}>
          <CategoryChart data={a.salesByCategory} />
        </ChartCard>
        <ChartCard title="Customer growth" description="New vs returning customers, last 12 months" table={{ headers: ["Month", "New", "Returning"], rows: a.customerGrowth.map((c) => [c.label, c.newCustomers, c.returning]) }}>
          <CustomerGrowthChart data={a.customerGrowth} />
        </ChartCard>
        <ChartCard title="Orders by status" description="Current pipeline" table={{ headers: ["Status", "Orders"], rows: a.orderStatus.map((s) => [ORDER_STATUS_META[s.status].label, s.count]) }}>
          <StatusChart data={a.orderStatus} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <AdminCard>
          <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
            <h2 className="font-serif text-[1.45rem] leading-none">Recent orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] hover:text-clay">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-line text-[0.65rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-line/70 transition-colors last:border-0 hover:bg-bone/50">
                    <td className="px-6 py-3.5 font-mono text-[0.78rem]">
                      <Link href={`/admin/orders/${o.id}`} className="underline-offset-4 hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5">{o.customer.name}</td>
                    <td className="px-3 py-3.5 text-stone">{formatDate(o.createdAt)}</td>
                    <td className="px-3 py-3.5 text-right tabular-nums">{formatINR(o.total)}</td>
                    <td className="px-6 py-3.5">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        <AdminCard className="p-5 sm:p-6">
          <h2 className="mb-1 font-serif text-[1.45rem] leading-none">Stock alerts</h2>
          <p className="mb-5 text-[0.78rem] text-stone">Low and sold-out products</p>
          <ul className="space-y-3.5">
            {[...a.outOfStock.map((p) => ({ ...p, stock: 0 })), ...a.lowStock].slice(0, 6).map((p) => (
              <li key={p.productId}>
                <Link href={`/admin/products/${p.productId}`} className="group flex items-center gap-3">
                  <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-bone">
                    <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem] group-hover:text-clay">{p.name}</span>
                  <span className={cn("shrink-0 text-[0.72rem] font-medium tabular-nums", p.stock === 0 ? "text-danger" : "text-clay")}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</span>
                </Link>
              </li>
            ))}
            {a.outOfStock.length + a.lowStock.length === 0 && <li className="text-[0.85rem] text-stone">Everything is well stocked.</li>}
          </ul>
        </AdminCard>
      </div>
    </>
  );
}
