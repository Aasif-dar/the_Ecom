"use client";

import { Check, ClipboardCheck, PackageCheck, PackageOpen, Truck, Home, XCircle, type LucideIcon } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { formatDateTime, formatWeekday } from "@/lib/format";
import { ORDER_FLOW, statusIndex } from "@/lib/order-meta";

const STEPS: { status: OrderStatus; label: string; detail: string; icon: LucideIcon }[] = [
  { status: "processing", label: "Order placed", detail: "We've received your order", icon: ClipboardCheck },
  { status: "confirmed", label: "Confirmed", detail: "Your order is confirmed", icon: Check },
  { status: "packed", label: "Packed", detail: "Quality-checked and packed", icon: PackageOpen },
  { status: "shipped", label: "Shipped", detail: "Handed to the courier", icon: PackageCheck },
  { status: "out_for_delivery", label: "Out for delivery", detail: "With the delivery partner", icon: Truck },
  { status: "delivered", label: "Delivered", detail: "Delivered to your address", icon: Home },
];

export function OrderTimeline({ order, className }: { order: Order; className?: string }) {
  const current = statusIndex(order.status);
  const cancelled = order.status === "cancelled";
  const when = (s: OrderStatus) => order.timeline.find((t) => t.status === s);

  return (
    <ol className={cn("relative", className)} aria-label="Order progress">
      {STEPS.map((step, i) => {
        const entry = when(step.status);
        const done = !cancelled && i < current;
        const isCurrent = !cancelled && i === current;
        const reached = !!entry;
        const last = i === STEPS.length - 1 && !cancelled;
        const Icon = step.icon;
        return (
          <li key={step.status} className="relative flex gap-5 pb-9 last:pb-0" aria-current={isCurrent ? "step" : undefined}>
            {!last && (
              <span
                aria-hidden
                className={cn("absolute left-[1.15rem] top-10 h-[calc(100%-2.5rem)] w-px", done || (cancelled && reached && i < STEPS.length - 1 && when(STEPS[i + 1].status)) ? "bg-ink" : "border-l border-dashed border-sand bg-transparent")}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-[2.3rem] shrink-0 place-items-center rounded-full border transition-colors",
                done && "border-ink bg-ink text-paper",
                isCurrent && "border-clay bg-clay text-paper",
                !done && !isCurrent && reached && "border-ink bg-ink text-paper",
                !done && !isCurrent && !reached && "border-sand bg-paper text-stone",
              )}
            >
              {done || (reached && !isCurrent) ? <Check className="size-4" strokeWidth={2.5} /> : <Icon className="size-4" strokeWidth={1.6} />}
              {isCurrent && <span className="absolute inset-0 animate-ping rounded-full border border-clay opacity-40" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className={cn("text-[0.9375rem] font-medium leading-tight", !reached && !isCurrent && "text-stone")}>{step.label}</p>
              <p className="mt-1 text-[0.8125rem] text-stone">{entry ? entry.note ?? step.detail : step.detail}</p>
              {entry ? (
                <p className="mt-1.5 text-[0.75rem] uppercase tracking-[0.1em] text-graphite">{formatDateTime(entry.at)}</p>
              ) : (
                step.status === "delivered" && !cancelled && <p className="mt-1.5 text-[0.75rem] uppercase tracking-[0.1em] text-stone">Expected by {formatWeekday(order.estimatedDelivery)}</p>
              )}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="relative mt-9 flex gap-5">
          <span className="relative z-10 grid size-[2.3rem] shrink-0 place-items-center rounded-full border border-danger bg-danger text-paper">
            <XCircle className="size-4" />
          </span>
          <div className="pt-1">
            <p className="text-[0.9375rem] font-medium text-danger">Cancelled</p>
            <p className="mt-1 text-[0.8125rem] text-stone">{when("cancelled")?.note}</p>
            {when("cancelled") && <p className="mt-1.5 text-[0.75rem] uppercase tracking-[0.1em] text-graphite">{formatDateTime(when("cancelled")!.at)}</p>}
            {order.payment.method === "online" && <p className="mt-2 text-[0.8125rem] text-graphite">Refund of ₹{order.total.toLocaleString("en-IN")} issued to your original payment method.</p>}
          </div>
        </li>
      )}
    </ol>
  );
}

/** Compact horizontal progress used on order cards. */
export function OrderProgressBar({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return <div className="h-[3px] w-full bg-danger/40" aria-hidden />;
  const idx = ORDER_FLOW.indexOf(status);
  return (
    <div className="flex gap-1" aria-hidden>
      {ORDER_FLOW.map((s, i) => (
        <span key={s} className={cn("h-[3px] flex-1 transition-colors", i <= idx ? (status === "delivered" ? "bg-success" : "bg-ink") : "bg-sand")} />
      ))}
    </div>
  );
}
