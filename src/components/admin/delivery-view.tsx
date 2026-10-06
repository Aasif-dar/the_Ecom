"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, PackageCheck, Pencil, Search, Truck } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { DeliveryEditor } from "@/components/admin/order-detail-admin";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { SEED_NOW } from "@/data/seed-config";
import { formatDate } from "@/lib/format";
import { COURIER_PARTNERS } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orders";
import type { Order } from "@/types";

const SHIPPING = ["packed", "shipped", "out_for_delivery", "delivered"];

export function DeliveryView() {
  const orders = useOrderStore((s) => s.orders);
  const [q, setQ] = useState("");
  const [state, setState] = useState("active");
  const [partner, setPartner] = useState("all");
  const [editing, setEditing] = useState<Order | null>(null);

  const shipments = useMemo(() => orders.filter((o) => SHIPPING.includes(o.status)), [orders]);
  const now = Math.max(SEED_NOW, Date.now());
  const late = (o: Order) => o.status !== "delivered" && +new Date(o.estimatedDelivery) < now;

  const stats = useMemo(
    () => ({
      packed: shipments.filter((o) => o.status === "packed").length,
      transit: shipments.filter((o) => o.status === "shipped").length,
      ofd: shipments.filter((o) => o.status === "out_for_delivery").length,
      late: shipments.filter(late).length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shipments],
  );

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return shipments
      .filter((o) => (state === "active" ? o.status !== "delivered" : state === "delivered" ? o.status === "delivered" : state === "late" ? late(o) : true))
      .filter((o) => partner === "all" || o.delivery.partner === partner)
      .filter((o) => !term || o.id.toLowerCase().includes(term) || o.delivery.trackingId.toLowerCase().includes(term) || o.customer.name.toLowerCase().includes(term) || o.address.city.toLowerCase().includes(term))
      .slice(0, 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipments, q, state, partner]);

  const opts = (value: string, onChange: (v: string) => void, label: string, options: { value: string; label: string }[]) => (
    <Select value={value} onValueChange={(v) => onChange(v as string)} items={options}>
      <SelectTrigger size="sm" aria-label={label} className="h-10 min-w-40">
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

  return (
    <>
      <AdminPageHeader title="Delivery" description="Track every shipment from the studio to the doorstep." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: "Packed, awaiting courier", v: stats.packed, icon: PackageCheck },
          { l: "In transit", v: stats.transit, icon: Truck },
          { l: "Out for delivery", v: stats.ofd, icon: CheckCircle2 },
          { l: "Running late", v: stats.late, icon: Clock, alert: stats.late > 0 },
        ].map((s) => (
          <div key={s.l} className={cn("border bg-paper-2 p-5", s.alert ? "border-clay/50" : "border-line")}>
            <div className="flex items-start justify-between">
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone">{s.l}</p>
              <s.icon className={cn("size-[1.1rem]", s.alert ? "text-clay" : "text-stone")} strokeWidth={1.3} />
            </div>
            <p className="mt-4 font-serif text-[2.4rem] leading-none tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>

      <AdminCard className="mt-6">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 sm:p-5">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, tracking ID, customer or city" aria-label="Search shipments" className="h-10 pl-10" />
          </div>
          {opts(state, setState, "Shipment state", [{ value: "active", label: "In progress" }, { value: "late", label: "Running late" }, { value: "delivered", label: "Delivered" }, { value: "all", label: "All shipments" }])}
          {opts(partner, setPartner, "Delivery partner", [{ value: "all", label: "All partners" }, ...COURIER_PARTNERS.map((c) => ({ value: c, label: c }))])}
        </div>
        {list.length === 0 ? (
          <EmptyState compact icon={Truck} title="No shipments here" body="Orders appear once they've been packed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-line bg-bone/50 text-[0.65rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Ship to</th>
                  <th className="px-3 py-3 font-medium">Partner</th>
                  <th className="px-3 py-3 font-medium">Tracking ID</th>
                  <th className="px-3 py-3 font-medium">ETA</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((o) => (
                  <tr key={o.id} className="border-b border-line/70 last:border-0 hover:bg-bone/40">
                    <td className="px-5 py-3 font-mono text-[0.78rem]">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.id}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-[0.75rem] text-stone">
                        {o.address.city}, {o.address.state} {o.address.pincode}
                      </p>
                    </td>
                    <td className="px-3 py-3">{o.delivery.partner}</td>
                    <td className="px-3 py-3 font-mono text-[0.75rem]">{o.delivery.trackingId}</td>
                    <td className="px-3 py-3">
                      {formatDate(o.estimatedDelivery)}
                      {late(o) && <Badge variant="warning" className="ml-2">Late</Badge>}
                    </td>
                    <td className="px-3 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" aria-label={`Edit shipment ${o.id}`} onClick={() => setEditing(o)} className="grid size-8 place-items-center text-stone hover:bg-bone hover:text-ink">
                        <Pencil className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
      {editing && <DeliveryEditor order={editing} open onOpenChange={(o) => !o && setEditing(null)} />}
    </>
  );
}
