"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { StatusUpdater } from "@/components/admin/status-updater";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import { ALL_ORDER_STATUSES, ORDER_STATUS_META } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orders";
import { SEED_NOW } from "@/data/seed-config";

const PAGE = 15;
const DAY = 24 * 60 * 60 * 1000;

function Sel({ value, onChange, label, options }: { value: string; onChange: (v: string) => void; label: string; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as string)} items={options}>
      <SelectTrigger size="sm" aria-label={label} className="h-10 min-w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OrdersAdminView() {
  const orders = useOrderStore((s) => s.orders);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [pay, setPay] = useState("all");
  const [method, setMethod] = useState("all");
  const [range, setRange] = useState("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders) m.set(o.status, (m.get(o.status) ?? 0) + 1);
    return m;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const anchor = Math.max(SEED_NOW, Date.now());
    const days = range === "all" ? 0 : Number(range);
    return orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (pay !== "all" && o.payment.status !== pay) return false;
      if (method !== "all" && o.payment.method !== method) return false;
      if (days && +new Date(o.createdAt) < anchor - days * DAY) return false;
      if (term && !(o.id.toLowerCase().includes(term) || o.customer.name.toLowerCase().includes(term) || o.customer.email.toLowerCase().includes(term) || o.customer.phone.replace(/\s/g, "").includes(term.replace(/\s/g, "")) || o.items.some((i) => i.name.toLowerCase().includes(term)))) return false;
      return true;
    });
  }, [orders, q, status, pay, method, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE);
  const set = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setPage(1);
  };

  return (
    <>
      <AdminPageHeader title="Orders" description={`${orders.length} orders · ${orders.filter((o) => ["processing", "confirmed", "packed"].includes(o.status)).length} waiting to ship`} />

      <div role="tablist" aria-label="Order status" className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[{ value: "all", label: "All", count: orders.length }, ...ALL_ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label, count: counts.get(s) ?? 0 }))].map((t) => (
          <button key={t.value} type="button" role="tab" aria-selected={status === t.value} onClick={() => set(setStatus)(t.value)} className={cn("shrink-0 border px-3.5 py-2 text-[0.78rem] transition-colors", status === t.value ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 hover:border-ink")}>
            {t.label} <span className="ml-1 tabular-nums opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      <AdminCard>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 sm:p-5">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <Input value={q} onChange={(e) => set(setQ)(e.target.value)} placeholder="Search order ID, customer, phone or product" aria-label="Search orders" className="h-10 pl-10" />
          </div>
          <Sel value={pay} onChange={set(setPay)} label="Payment status" options={[{ value: "all", label: "Any payment" }, { value: "paid", label: "Paid" }, { value: "pending", label: "Pending" }, { value: "refunded", label: "Refunded" }, { value: "failed", label: "Failed" }]} />
          <Sel value={method} onChange={set(setMethod)} label="Payment method" options={[{ value: "all", label: "Any method" }, { value: "online", label: "Online" }, { value: "cod", label: "Cash on delivery" }]} />
          <Sel value={range} onChange={set(setRange)} label="Date range" options={[{ value: "all", label: "All time" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }, { value: "90", label: "Last 90 days" }]} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState compact icon={ClipboardList} title="No orders match" body="Try a different search or loosen the filters." actions={<Button variant="outline" onClick={() => { setQ(""); setStatus("all"); setPay("all"); setMethod("all"); setRange("all"); }}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-line bg-bone/50 text-[0.65rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 text-right font-medium">Items</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-b border-line/70 last:border-0 hover:bg-bone/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-[0.78rem] font-medium underline-offset-4 hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-[0.75rem] text-stone">{o.address.city}</p>
                    </td>
                    <td className="px-3 py-3 text-graphite">
                      {formatDate(o.createdAt)}
                      <span className="block text-[0.75rem] text-stone">{formatTime(o.createdAt)}</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{formatINR(o.total)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <PaymentStatusBadge status={o.payment.status} />
                        <Badge variant="outline">{o.payment.method === "cod" ? "COD" : "Online"}</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusUpdater order={o} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-[0.78rem] text-stone">
          <span>
            Showing {filtered.length === 0 ? 0 : (current - 1) * PAGE + 1}–{Math.min(current * PAGE, filtered.length)} of {filtered.length}
          </span>
          <Pagination page={current} totalPages={totalPages} onChange={setPage} />
        </div>
      </AdminCard>
    </>
  );
}
