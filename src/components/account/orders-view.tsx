"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Package, Search } from "lucide-react";
import { AccountHeading } from "@/components/account/account-shell";
import { OrderCard } from "@/components/account/order-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isOpenOrder } from "@/lib/order-meta";
import { cn } from "@/lib/utils";
import { useMyOrders } from "@/store/hooks";
import { useHydrated } from "@/store/persist";

const TABS = [
  { id: "all", label: "All" },
  { id: "open", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export function OrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading orders">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-56 w-full" />
      ))}
    </div>
  );
}

export function OrdersView() {
  const orders = useMyOrders();
  const hydrated = useHydrated();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(
    () => ({
      all: orders.length,
      open: orders.filter((o) => isOpenOrder(o.status)).length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }),
    [orders],
  );

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders
      .filter((o) => (tab === "all" ? true : tab === "open" ? isOpenOrder(o.status) : o.status === tab))
      .filter((o) => !term || o.id.toLowerCase().includes(term) || o.items.some((i) => i.name.toLowerCase().includes(term)));
  }, [orders, tab, q]);

  return (
    <>
      <AccountHeading eyebrow="Account" title="My" accent="orders" />
      {!hydrated ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState
          compact
          icon={Package}
          title="No orders yet"
          body="Your orders will show up here with live tracking, from packing to your doorstep."
          actions={
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="tablist" aria-label="Filter orders" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn("shrink-0 border px-4 py-2 text-[0.8125rem] transition-colors", tab === t.id ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 hover:border-ink")}
                >
                  {t.label} <span className="ml-1 tabular-nums opacity-60">{counts[t.id]}</span>
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID or item" aria-label="Search your orders" className="pl-10" />
            </div>
          </div>
          {list.length === 0 ? (
            <p className="border border-dashed border-line py-14 text-center text-[0.9375rem] text-stone">No orders match this view.</p>
          ) : (
            <div className="space-y-4">
              {list.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
