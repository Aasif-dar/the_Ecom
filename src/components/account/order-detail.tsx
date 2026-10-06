"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarClock, CreditCard, MapPin, Printer, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Order, Product } from "@/types";
import { AddressBlock } from "@/components/account/address-card";
import { OrderTimeline } from "@/components/account/order-timeline";
import { WriteReviewDialog } from "@/components/product/review-section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, formatINR, formatWeekday } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";
import { useOrderStore } from "@/store/orders";
import { useReviewStore } from "@/store/reviews";

export function OrderDetail({ order, backHref = "/account/orders", readOnly = false }: { order: Order; backHref?: string; readOnly?: boolean }) {
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const products = useCatalogStore((s) => s.products);
  const reviews = useReviewStore((s) => s.reviews);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reviewing, setReviewing] = useState<Product | null>(null);

  const canCancel = !readOnly && ["processing", "confirmed", "packed"].includes(order.status);
  const delivered = order.status === "delivered";
  const open = !["delivered", "cancelled"].includes(order.status);

  return (
    <div>
      <Link href={backHref} className="mb-6 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-graphite hover:text-ink print:hidden">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-8">
        <div>
          <p className="eyebrow mb-3 text-clay">Order</p>
          <h1 className="font-serif text-[2.2rem] leading-none tracking-tight sm:text-[2.8rem]">{order.id}</h1>
          <p className="mt-3 text-[0.875rem] text-stone">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <PaymentStatusBadge status={order.payment.status} />
          <OrderStatusBadge status={order.status} />
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5" /> Invoice
          </Button>
          {canCancel && (
            <Button variant="destructive" size="sm" onClick={() => setConfirmCancel(true)}>
              Cancel order
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-10 xl:grid-cols-[1.2fr_1fr] xl:gap-14">
        <div className="space-y-10">
          <section aria-labelledby="od-track" className="border border-line bg-paper-2 p-6 sm:p-8">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <h2 id="od-track" className="font-serif text-[1.9rem] leading-none">
                Track order
              </h2>
              {open && (
                <p className="flex items-center gap-2 text-[0.8125rem] text-graphite">
                  <CalendarClock className="size-4" /> Arriving by <strong className="font-medium text-ink">{formatWeekday(order.estimatedDelivery)}</strong>
                </p>
              )}
            </div>
            {order.status !== "processing" && order.status !== "cancelled" && (
              <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 border border-line bg-paper px-5 py-4 text-[0.8125rem]">
                <span className="flex items-center gap-2.5">
                  <Truck className="size-4" strokeWidth={1.4} />
                  <span>
                    <span className="block text-[0.625rem] uppercase tracking-[0.14em] text-stone">Courier</span>
                    {order.delivery.partner}
                  </span>
                </span>
                <span>
                  <span className="block text-[0.625rem] uppercase tracking-[0.14em] text-stone">Tracking ID</span>
                  <span className="font-mono tracking-wide">{order.delivery.trackingId}</span>
                </span>
              </div>
            )}
            <OrderTimeline order={order} />
          </section>

          <section aria-labelledby="od-items">
            <h2 id="od-items" className="mb-5 font-serif text-[1.9rem] leading-none">
              Items <span className="font-sans text-base text-stone">({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {order.items.map((it) => {
                const product = products.find((p) => p.id === it.productId);
                const alreadyReviewed = reviews.some((r) => r.productId === it.productId && r.userId === order.userId);
                return (
                  <li key={`${it.productId}-${it.color}-${it.size}`} className="flex gap-4 py-5 sm:gap-6">
                    <Link href={`/product/${it.slug}`} className="relative h-[110px] w-[88px] shrink-0 overflow-hidden bg-bone sm:h-[130px] sm:w-[104px]">
                      <Image src={it.image} alt={it.name} fill sizes="110px" className="object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/product/${it.slug}`} className="line-clamp-2 text-[0.9375rem] hover:text-clay">
                            {it.name}
                          </Link>
                          <p className="mt-1 text-[0.8125rem] text-stone">
                            {it.color}
                            {it.size !== "One Size" && ` · Size ${it.size}`} · Qty {it.quantity}
                          </p>
                          <p className="mt-0.5 font-mono text-[0.7rem] text-stone/80">{it.sku}</p>
                        </div>
                        <p className="shrink-0 text-[0.9375rem] font-medium tabular-nums">{formatINR(it.price * it.quantity)}</p>
                      </div>
                      {delivered && !readOnly && product && (
                        <div className="mt-auto pt-3 print:hidden">
                          {alreadyReviewed ? (
                            <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-success">
                              <Star className="size-3.5 fill-current" /> Reviewed. Thank you
                            </span>
                          ) : (
                            <button type="button" onClick={() => setReviewing(product)} className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-clay hover:underline">
                              <Star className="size-3.5" /> Write a review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="border border-line bg-paper-2 p-6 sm:p-7" aria-labelledby="od-sum">
            <h2 id="od-sum" className="mb-5 font-serif text-[1.6rem] leading-none">
              Payment summary
            </h2>
            <dl className="space-y-3 text-[0.9rem]">
              <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd className="tabular-nums">{formatINR(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd className={cn("tabular-nums", order.discount > 0 && "text-success")}>{order.discount > 0 ? `− ${formatINR(order.discount)}` : formatINR(0)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Shipping</dt><dd className="tabular-nums">{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd></div>
              {order.codFee > 0 && <div className="flex justify-between"><dt className="text-graphite">COD fee</dt><dd className="tabular-nums">{formatINR(order.codFee)}</dd></div>}
              <div className="flex justify-between"><dt className="text-graphite">GST (included)</dt><dd className="tabular-nums text-stone">{formatINR(order.tax)}</dd></div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-ink pt-4">
              <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em]">Total</span>
              <span className="font-serif text-[2rem] leading-none tabular-nums">{formatINR(order.total)}</span>
            </div>
          </section>

          <section className="border border-line bg-paper-2 p-6 sm:p-7" aria-labelledby="od-addr">
            <h2 id="od-addr" className="mb-4 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              <MapPin className="size-4" strokeWidth={1.4} /> Delivery address
            </h2>
            <AddressBlock address={order.address} />
          </section>

          <section className="border border-line bg-paper-2 p-6 sm:p-7" aria-labelledby="od-pay">
            <h2 id="od-pay" className="mb-4 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              <CreditCard className="size-4" strokeWidth={1.4} /> Payment
            </h2>
            <dl className="space-y-2 text-[0.9rem]">
              <div className="flex justify-between gap-4"><dt className="text-stone">Method</dt><dd>{PAYMENT_METHOD_LABEL[order.payment.method]}</dd></div>
              {order.payment.instrument && order.payment.method === "online" && <div className="flex justify-between gap-4"><dt className="text-stone">Paid with</dt><dd>{order.payment.instrument}</dd></div>}
              {order.payment.transactionId && <div className="flex justify-between gap-4"><dt className="text-stone">Transaction</dt><dd className="font-mono text-[0.78rem]">{order.payment.transactionId}</dd></div>}
              <div className="flex justify-between gap-4"><dt className="text-stone">Status</dt><dd><PaymentStatusBadge status={order.payment.status} /></dd></div>
            </dl>
          </section>

          <p className="text-[0.8125rem] text-stone print:hidden">
            Need help with this order?{" "}
            <Link href="/contact" className="underline underline-offset-4 hover:text-ink">
              Contact us
            </Link>
            {delivered && (
              <>
                {" "}or read our{" "}
                <Link href="/returns" className="underline underline-offset-4 hover:text-ink">
                  returns policy
                </Link>
              </>
            )}
            .
          </p>
        </div>
      </div>

      <Modal
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this order?"
        description={`Order ${order.id} · ${formatINR(order.total)}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
              Keep order
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                cancelOrder(order.id);
                setConfirmCancel(false);
                toast.success("Order cancelled", { description: order.payment.method === "online" ? "Your refund will arrive in 3–5 working days." : undefined });
              }}
            >
              Yes, cancel order
            </Button>
          </>
        }
      >
        <p className="text-[0.9rem] leading-relaxed text-graphite">Items go back into stock and, if you paid online, we'll refund the full amount to your original payment method.</p>
      </Modal>

      {reviewing && <WriteReviewDialog product={reviewing} open onOpenChange={(o) => !o && setReviewing(null)} orderId={order.id} />}
      <Link href="/shop" className={cn(buttonVariants({ variant: "outline" }), "mt-10 print:hidden")}>
        Continue shopping
      </Link>
      <span className="sr-only">{formatDate(order.createdAt)}</span>
    </div>
  );
}
