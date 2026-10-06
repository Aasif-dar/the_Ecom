"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CalendarClock, CreditCard, MapPin, Pencil, Printer, Truck, User } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/types";
import { AdminCard } from "@/components/admin/page-header";
import { StatusUpdater } from "@/components/admin/status-updater";
import { OrderTimeline } from "@/components/account/order-timeline";
import { AddressBlock } from "@/components/account/address-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { COURIER_PARTNERS, PAYMENT_METHOD_LABEL } from "@/lib/order-meta";
import { useOrderStore } from "@/store/orders";
import { PackageX } from "lucide-react";

export function DeliveryEditor({ order, open, onOpenChange }: { order: Order; open: boolean; onOpenChange: (o: boolean) => void }) {
  const update = useOrderStore((s) => s.updateDelivery);
  const [partner, setPartner] = useState<string>(order.delivery.partner);
  const [tracking, setTracking] = useState(order.delivery.trackingId);
  const [eta, setEta] = useState(order.estimatedDelivery.slice(0, 10));
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit shipment"
      description={`Order ${order.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!tracking.trim()) return toast.error("Enter a tracking ID");
              update(order.id, { partner, trackingId: tracking.trim(), estimatedDelivery: new Date(`${eta}T20:00:00+05:30`).toISOString() });
              toast.success("Shipment updated");
              onOpenChange(false);
            }}
          >
            Save shipment
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Delivery partner</span>
          <Select value={partner} onValueChange={(v) => setPartner(v as string)} items={COURIER_PARTNERS.map((c) => ({ value: c, label: c }))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {COURIER_PARTNERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Tracking ID</span>
          <Input value={tracking} onChange={(e) => setTracking(e.target.value)} className="font-mono" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Estimated delivery</span>
          <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
        </label>
      </div>
    </Modal>
  );
}

export function AdminOrderDetail({ id }: { id: string }) {
  const order = useOrderStore((s) => s.orders.find((o) => o.id === id));
  const [edit, setEdit] = useState(false);

  if (!order) {
    return (
      <EmptyState
        icon={PackageX}
        title="Order not found"
        body="Check the order number, or return to the list."
        actions={
          <Link href="/admin/orders" className={buttonVariants({ size: "lg" })}>
            All orders
          </Link>
        }
      />
    );
  }

  return (
    <>
      <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-graphite hover:text-ink print:hidden">
        <ArrowLeft className="size-4" /> All orders
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment.status} />
          </div>
          <h1 className="font-mono text-[1.9rem] font-medium leading-none tracking-tight sm:text-[2.3rem]">{order.id}</h1>
          <p className="mt-2.5 text-[0.85rem] text-stone">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <StatusUpdater order={order} />
          <Button variant="outline" size="icon-lg" aria-label="Print" onClick={() => window.print()}>
            <Printer className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-6">
          <AdminCard>
            <h2 className="border-b border-line px-5 py-4 font-serif text-[1.45rem] leading-none sm:px-6">Items</h2>
            <ul className="divide-y divide-line">
              {order.items.map((it) => (
                <li key={`${it.productId}-${it.color}-${it.size}`} className="flex gap-4 px-5 py-4 sm:px-6">
                  <Link href={`/admin/products/${it.productId}`} className="relative h-[84px] w-[67px] shrink-0 overflow-hidden bg-bone">
                    <Image src={it.image} alt={it.name} fill sizes="70px" unoptimized={it.image.startsWith("data:")} className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.9rem]">{it.name}</p>
                    <p className="mt-1 text-[0.8rem] text-stone">
                      {it.color}
                      {it.size !== "One Size" && ` · ${it.size}`} · Qty {it.quantity}
                    </p>
                    <p className="mt-0.5 font-mono text-[0.7rem] text-stone/80">{it.sku}</p>
                  </div>
                  <p className="text-[0.9rem] font-medium tabular-nums">{formatINR(it.price * it.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2.5 border-t border-line bg-bone/40 px-5 py-5 text-[0.85rem] sm:px-6">
              <div className="flex justify-between"><dt className="text-graphite">Subtotal</dt><dd className="tabular-nums">{formatINR(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd className="tabular-nums text-success">− {formatINR(order.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-graphite">Shipping</dt><dd className="tabular-nums">{order.shipping ? formatINR(order.shipping) : "Free"}</dd></div>
              {order.codFee > 0 && <div className="flex justify-between"><dt className="text-graphite">COD fee</dt><dd className="tabular-nums">{formatINR(order.codFee)}</dd></div>}
              <div className="flex justify-between"><dt className="text-graphite">GST (included)</dt><dd className="tabular-nums text-stone">{formatINR(order.tax)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-ink pt-3">
                <dt className="text-[0.72rem] font-medium uppercase tracking-[0.14em]">Total</dt>
                <dd className="font-serif text-[1.8rem] leading-none tabular-nums">{formatINR(order.total)}</dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard className="p-5 sm:p-7">
            <h2 className="mb-6 font-serif text-[1.45rem] leading-none">Order timeline</h2>
            <OrderTimeline order={order} />
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              <User className="size-4" strokeWidth={1.4} /> Customer
            </h2>
            <p className="font-medium">{order.customer.name}</p>
            <p className="mt-1 break-all text-[0.85rem] text-graphite">{order.customer.email}</p>
            <p className="text-[0.85rem] text-graphite">{order.customer.phone}</p>
            <Link href={`/admin/customers/${order.userId}`} className="mt-4 inline-block text-[0.72rem] font-medium uppercase tracking-[0.14em] underline underline-offset-4 hover:text-clay">
              View customer
            </Link>
          </AdminCard>

          <AdminCard className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              <MapPin className="size-4" strokeWidth={1.4} /> Shipping address
            </h2>
            <AddressBlock address={order.address} />
          </AdminCard>

          <AdminCard className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              <CreditCard className="size-4" strokeWidth={1.4} /> Payment
            </h2>
            <dl className="space-y-2 text-[0.85rem]">
              <div className="flex justify-between gap-3"><dt className="text-stone">Method</dt><dd>{PAYMENT_METHOD_LABEL[order.payment.method]}</dd></div>
              {order.payment.instrument && <div className="flex justify-between gap-3"><dt className="text-stone">Instrument</dt><dd className="text-right">{order.payment.instrument}</dd></div>}
              {order.payment.transactionId && <div className="flex justify-between gap-3"><dt className="text-stone">Transaction</dt><dd className="font-mono text-[0.75rem]">{order.payment.transactionId}</dd></div>}
              <div className="flex items-center justify-between gap-3"><dt className="text-stone">Status</dt><dd><PaymentStatusBadge status={order.payment.status} /></dd></div>
            </dl>
          </AdminCard>

          <AdminCard className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
                <Truck className="size-4" strokeWidth={1.4} /> Delivery
              </h2>
              <button type="button" onClick={() => setEdit(true)} className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-stone hover:text-ink print:hidden">
                <Pencil className="size-3.5" /> Edit
              </button>
            </div>
            <dl className="space-y-2 text-[0.85rem]">
              <div className="flex justify-between gap-3"><dt className="text-stone">Partner</dt><dd>{order.delivery.partner}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-stone">Tracking ID</dt><dd className="font-mono text-[0.75rem]">{order.delivery.trackingId}</dd></div>
              <div className="flex justify-between gap-3"><dt className="flex items-center gap-1.5 text-stone"><CalendarClock className="size-3.5" /> ETA</dt><dd>{formatDate(order.estimatedDelivery)}</dd></div>
            </dl>
          </AdminCard>
        </div>
      </div>
      {edit && <DeliveryEditor order={order} open onOpenChange={setEdit} />}
    </>
  );
}
