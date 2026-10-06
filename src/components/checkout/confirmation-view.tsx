"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { PackageX } from "lucide-react";
import { AddressBlock } from "@/components/account/address-card";
import { CheckoutStepper } from "@/components/checkout/stepper";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, formatWeekday } from "@/lib/format";
import { PAYMENT_METHOD_LABEL } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useCurrentUser, useMyOrders } from "@/store/hooks";
import { useHydrated } from "@/store/persist";

export function ConfirmationView({ id }: { id: string }) {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const order = useMyOrders().find((o) => o.id === id);

  if (!hydrated) {
    return (
      <div className="container-x py-16">
        <Skeleton className="mx-auto h-24 w-24 rounded-full" />
        <Skeleton className="mx-auto mt-8 h-12 w-96 max-w-full" />
      </div>
    );
  }
  if (!user || !order) {
    return (
      <div className="container-x">
        <EmptyState
          icon={PackageX}
          title="We couldn't find that order"
          body={user ? "This order doesn't belong to your account." : "Please sign in to see your order confirmation."}
          actions={
            <Link href={user ? "/account/orders" : "/login"} className={buttonVariants({ size: "lg" })}>
              {user ? "View my orders" : "Sign in"}
            </Link>
          }
        />
      </div>
    );
  }

  const cod = order.payment.method === "cod";
  return (
    <div className="container-x pb-4 pt-10 sm:pt-14">
      <div className="mb-12 flex justify-center">
        <CheckoutStepper step={4} />
      </div>

      <div className="mx-auto max-w-2xl text-center">
        <motion.svg
          initial="hidden"
          animate="show"
          viewBox="0 0 96 96"
          className="mx-auto size-24 text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <motion.circle cx="48" cy="48" r="43" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.9, ease: "easeOut" } } }} />
          <motion.path d="M30 49l12 12 25-27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.6, delay: 0.7, ease: "easeOut" } } }} />
        </motion.svg>
        <p className="eyebrow mb-4 mt-8 text-clay">Thank you, {user.name.split(" ")[0]}</p>
        <h1 className="display-lg">
          Order placed <em className="font-serif italic">successfully.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[1rem] leading-relaxed text-graphite">
          {cod ? "Please keep the exact amount ready for the delivery partner." : "We've received your payment."} A confirmation is on its way to <span className="text-ink">{order.customer.email}</span>.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl border border-line bg-paper-2 sm:grid-cols-3 sm:divide-x sm:divide-line">
        {[
          { label: "Order number", value: order.id, mono: true },
          { label: "Estimated delivery", value: formatWeekday(order.estimatedDelivery) },
          { label: "Total amount", value: formatINR(order.total) },
        ].map((x) => (
          <div key={x.label} className="border-b border-line p-6 text-center last:border-0 sm:border-b-0">
            <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-stone">{x.label}</p>
            <p className={cn("mt-2 text-[1.2rem]", x.mono ? "font-mono tracking-wide" : "font-serif text-[1.7rem] leading-none")}>{x.value}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-10 md:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="oc-items">
          <h2 id="oc-items" className="mb-4 font-serif text-[1.7rem] leading-none">
            Your items
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {order.items.map((it) => (
              <li key={`${it.productId}-${it.color}-${it.size}`} className="flex gap-4 py-4">
                <div className="relative h-[88px] w-[70px] shrink-0 overflow-hidden bg-bone">
                  <Image src={it.image} alt={it.name} fill sizes="72px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[0.9rem]">{it.name}</p>
                  <p className="mt-1 text-[0.8125rem] text-stone">
                    {it.color}
                    {it.size !== "One Size" && ` · ${it.size}`} · Qty {it.quantity}
                  </p>
                </div>
                <p className="text-[0.9rem] font-medium tabular-nums">{formatINR(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>
        <div className="space-y-8">
          <section aria-labelledby="oc-addr">
            <h2 id="oc-addr" className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              Delivery address
            </h2>
            <AddressBlock address={order.address} />
          </section>
          <section aria-labelledby="oc-pay">
            <h2 id="oc-pay" className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              Payment method
            </h2>
            <p className="text-[0.9rem] text-graphite">
              {PAYMENT_METHOD_LABEL[order.payment.method]}
              {order.payment.instrument && !cod && <span className="block text-stone">{order.payment.instrument}</span>}
              {cod && <span className="block text-stone">Pay {formatINR(order.total)} on delivery</span>}
            </p>
          </section>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-4xl flex-col justify-center gap-3 sm:flex-row">
        <Link href={`/account/orders/${order.id}`} className={buttonVariants({ size: "lg" })}>
          Track order
        </Link>
        <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
