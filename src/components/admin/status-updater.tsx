"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ALL_ORDER_STATUSES, ORDER_FLOW, ORDER_STATUS_META } from "@/lib/order-meta";
import { useOrderStore } from "@/store/orders";

const ITEMS = ALL_ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label }));

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = ORDER_FLOW.indexOf(status);
  return i >= 0 && i < ORDER_FLOW.length - 1 ? ORDER_FLOW[i + 1] : null;
}

/** Status control used in the orders table (compact) and on the order page (full). */
export function StatusUpdater({ order, compact = false }: { order: Order; compact?: boolean }) {
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const next = nextStatus(order.status);
  const locked = order.status === "delivered" || order.status === "cancelled";

  const apply = (status: OrderStatus, n?: string) => {
    updateStatus(order.id, status, n?.trim() || undefined);
    toast.success(`Order ${order.id} marked ${ORDER_STATUS_META[status].label.toLowerCase()}`, { description: "The customer has been notified and sees the update now." });
  };

  const request = (status: OrderStatus) => {
    if (status === order.status) return;
    if (compact && status !== "cancelled") return apply(status);
    setNote("");
    setPending(status);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={order.status} onValueChange={(v) => request(v as OrderStatus)} items={ITEMS} disabled={locked && compact}>
          <SelectTrigger size="sm" aria-label={`Update status of ${order.id}`} className={compact ? "h-8 min-w-36 text-[0.78rem]" : "h-11 min-w-48"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {ITEMS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!compact && next && (
          <Button onClick={() => request(next)}>
            Mark {ORDER_STATUS_META[next].label.toLowerCase()} <ArrowRight className="size-4" />
          </Button>
        )}
      </div>

      <Modal
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending === "cancelled" ? "Cancel this order?" : `Mark as ${pending ? ORDER_STATUS_META[pending].label.toLowerCase() : ""}`}
        description={`Order ${order.id} · ${order.customer.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Back
            </Button>
            <Button
              variant={pending === "cancelled" ? "destructive" : "default"}
              onClick={() => {
                if (pending) apply(pending, note);
                setPending(null);
              }}
            >
              {pending === "cancelled" ? "Cancel order" : "Update status"}
            </Button>
          </>
        }
      >
        <p className="text-[0.875rem] leading-relaxed text-graphite">
          {pending === "cancelled"
            ? "Stock goes back on the shelf. If it was paid online the payment is marked refunded."
            : `The customer is notified: “${pending ? ORDER_STATUS_META[pending].customerMessage : ""}”`}
        </p>
        <label className="mt-5 block">
          <span className="mb-2 block text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Note to customer (optional)</span>
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Left Mumbai hub, arriving Thursday" />
        </label>
      </Modal>
    </>
  );
}
