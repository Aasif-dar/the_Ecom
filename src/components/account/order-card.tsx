"use client";

import Image from "next/image";
import Link from "next/link";
import type { Order } from "@/types";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { OrderProgressBar } from "@/components/account/order-timeline";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatINR, formatWeekday } from "@/lib/format";
import { PAYMENT_METHOD_LABEL, isOpenOrder } from "@/lib/order-meta";
import { cn } from "@/lib/utils";

export function OrderCard({ order, href }: { order: Order; href?: string }) {
  const to = href ?? `/account/orders/${order.id}`;
  const open = isOpenOrder(order.status);
  const units = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <article className="border border-line bg-paper-2">
      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-line px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[0.8125rem]">
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.14em] text-stone">Order</p>
            <p className="mt-0.5 font-mono text-[0.875rem] font-medium tracking-wide">{order.id}</p>
          </div>
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.14em] text-stone">Placed</p>
            <p className="mt-0.5 text-[0.875rem]">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.14em] text-stone">Total</p>
            <p className="mt-0.5 text-[0.875rem] font-medium tabular-nums">{formatINR(order.total)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PaymentStatusBadge status={order.payment.status} />
          <OrderStatusBadge status={order.status} />
        </div>
      </header>

      <div className="grid gap-6 px-5 py-5 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <ul className="flex gap-3 overflow-x-auto no-scrollbar" aria-label="Items in this order">
            {order.items.map((it) => (
              <li key={`${it.productId}-${it.color}-${it.size}`} className="flex w-[15.5rem] shrink-0 gap-3">
                <Link href={`/product/${it.slug}`} className="relative h-[84px] w-[67px] shrink-0 overflow-hidden bg-bone">
                  <Image src={it.image} alt={it.name} fill sizes="70px" className="object-cover" />
                </Link>
                <div className="min-w-0 text-[0.8125rem]">
                  <p className="line-clamp-2 leading-snug text-ink">{it.name}</p>
                  <p className="mt-1 text-stone">
                    {it.color}
                    {it.size !== "One Size" && ` · ${it.size}`} · Qty {it.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 max-w-md">
            <OrderProgressBar status={order.status} />
            <p className="mt-2.5 text-[0.8125rem] text-graphite">
              {order.status === "delivered"
                ? `Delivered on ${formatDate(order.timeline.at(-1)?.at ?? order.createdAt)}`
                : order.status === "cancelled"
                  ? "This order was cancelled"
                  : `Arriving by ${formatWeekday(order.estimatedDelivery)}`}
              <span className="text-stone"> · {units} {units === 1 ? "item" : "items"} · {PAYMENT_METHOD_LABEL[order.payment.method]}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3 md:flex-col">
          <Link href={to} className={cn(buttonVariants({ variant: open ? "default" : "outline", size: "sm" }), "flex-1")}>
            {open ? "Track order" : "View details"}
          </Link>
          {open && (
            <Link href={to} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
