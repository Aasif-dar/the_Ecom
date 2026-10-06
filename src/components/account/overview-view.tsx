"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Heart, MapPin, Package, Star, Truck } from "lucide-react";
import { AccountHeading } from "@/components/account/account-shell";
import { AddressBlock } from "@/components/account/address-card";
import { OrderCard } from "@/components/account/order-card";
import { buttonVariants } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { isOpenOrder } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useReviewStore } from "@/store/reviews";
import { useWishlistStore } from "@/store/wishlist";
import { useCurrentUser, useMyOrders } from "@/store/hooks";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function OverviewView() {
  const user = useCurrentUser();
  const orders = useMyOrders();
  const wishCount = useWishlistStore((s) => s.items.length);
  const reviews = useReviewStore((s) => s.reviews);
  const myReviews = useMemo(() => reviews.filter((r) => r.userId === user?.id).length, [reviews, user]);
  if (!user) return null;

  const open = orders.filter((o) => isOpenOrder(o.status));
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const address = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];

  const stats = [
    { label: "Orders", value: orders.length, icon: Package, href: "/account/orders" },
    { label: "On the way", value: open.length, icon: Truck, href: "/account/orders" },
    { label: "Wishlist", value: wishCount, icon: Heart, href: "/account/wishlist" },
    { label: "Reviews", value: myReviews, icon: Star, href: "/account/reviews" },
  ];

  return (
    <>
      <AccountHeading eyebrow="Overview" title={`${greeting()},`} accent={`${user.name.split(" ")[0]}.`} />

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="group block border border-line bg-paper-2 p-5 transition-colors hover:border-ink">
              <s.icon className="size-5 text-stone transition-colors group-hover:text-ink" strokeWidth={1.3} />
              <p className="mt-5 font-serif text-[2.8rem] leading-none tabular-nums">{s.value}</p>
              <p className="mt-2 text-[0.75rem] uppercase tracking-[0.14em] text-stone">{s.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      {orders.length > 0 && (
        <p className="mt-6 text-[0.875rem] text-stone">
          You've spent <strong className="font-medium text-ink">{formatINR(spent)}</strong> with us since {new Date(user.createdAt).getFullYear()}. Thank you.
        </p>
      )}

      <section className="mt-12" aria-labelledby="ov-orders">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="ov-orders" className="font-serif text-[2rem] leading-none">
            {open.length > 0 ? "On the way" : "Recent orders"}
          </h2>
          <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:text-clay">
            All orders <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="border border-dashed border-line p-10 text-center">
            <p className="font-serif text-[1.6rem]">No orders yet</p>
            <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-stone">When you place your first order it will appear here with live tracking.</p>
            <Link href="/shop" className={cn(buttonVariants(), "mt-6")}>
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(open.length ? open : orders).slice(0, 2).map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <section className="border border-line bg-paper-2 p-6" aria-labelledby="ov-addr">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="ov-addr" className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              <MapPin className="size-4" strokeWidth={1.4} /> Default address
            </h2>
            <Link href="/account/addresses" className="text-[0.75rem] text-stone underline underline-offset-4 hover:text-ink">
              Manage
            </Link>
          </div>
          {address ? <AddressBlock address={address} /> : <p className="text-[0.9rem] text-stone">No address saved yet.</p>}
        </section>
        <section className="border border-line bg-paper-2 p-6" aria-labelledby="ov-profile">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="ov-profile" className="text-[0.72rem] font-medium uppercase tracking-[0.16em]">
              Profile
            </h2>
            <Link href="/account/profile" className="text-[0.75rem] text-stone underline underline-offset-4 hover:text-ink">
              Edit
            </Link>
          </div>
          <dl className="space-y-2 text-[0.9rem]">
            <div className="flex gap-4">
              <dt className="w-16 shrink-0 text-stone">Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-16 shrink-0 text-stone">Email</dt>
              <dd className="break-all">{user.email}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-16 shrink-0 text-stone">Mobile</dt>
              <dd>{user.phone}</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
