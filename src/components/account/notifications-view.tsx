"use client";

import Link from "next/link";
import { Bell, CheckCheck, Gift, Package, PackageCheck, PackageX, Truck, XCircle, type LucideIcon } from "lucide-react";
import type { NotificationKind } from "@/types";
import { AccountHeading } from "@/components/account/account-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/orders";
import { useCurrentUser, useMyNotifications } from "@/store/hooks";

const ICONS: Record<NotificationKind, LucideIcon> = {
  order_placed: Package,
  order_confirmed: CheckCheck,
  order_packed: PackageCheck,
  order_shipped: Truck,
  order_out_for_delivery: Truck,
  order_delivered: PackageCheck,
  order_cancelled: XCircle,
  offer: Gift,
  system: Bell,
};

export function NotificationsView() {
  const user = useCurrentUser();
  const list = useMyNotifications();
  const markRead = useOrderStore((s) => s.markRead);
  const markAllRead = useOrderStore((s) => s.markAllRead);
  const clearAll = useOrderStore((s) => s.clearNotifications);
  if (!user) return null;
  const unread = list.filter((n) => !n.read).length;

  return (
    <>
      <AccountHeading
        eyebrow="Account"
        title="Your"
        accent="notifications"
        action={
          list.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAllRead(user.id)} disabled={unread === 0}>
                <CheckCheck className="size-3.5" /> Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={() => clearAll(user.id)}>
                Clear all
              </Button>
            </div>
          )
        }
      />
      {list.length === 0 ? (
        <EmptyState
          compact
          icon={PackageX}
          title="No notifications"
          body="Order confirmations, shipping updates and offers will land here."
          actions={
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              Browse the shop
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {list.map((n) => {
            const Icon = ICONS[n.kind];
            const inner = (
              <>
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-full", n.read ? "bg-bone text-stone" : "bg-ink text-paper")}>
                  <Icon className="size-[1.15rem]" strokeWidth={1.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-3">
                    <span className={cn("text-[0.9375rem]", !n.read && "font-medium")}>{n.title}</span>
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-clay" aria-label="Unread" />}
                  </span>
                  <span className="mt-1 block text-[0.875rem] leading-relaxed text-graphite">{n.body}</span>
                  <span className="mt-2 block text-[0.6875rem] uppercase tracking-[0.12em] text-stone">{relativeTime(n.createdAt)}</span>
                </span>
              </>
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} onClick={() => markRead(n.id)} className="flex gap-4 px-1 py-5 transition-colors hover:bg-bone/60 sm:gap-5 sm:px-3">
                    {inner}
                  </Link>
                ) : (
                  <button type="button" onClick={() => markRead(n.id)} className="flex w-full gap-4 px-1 py-5 text-left transition-colors hover:bg-bone/60 sm:gap-5 sm:px-3">
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
