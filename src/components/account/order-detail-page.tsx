"use client";

import Link from "next/link";
import { PackageX } from "lucide-react";
import { OrderDetail } from "@/components/account/order-detail";
import { OrdersSkeleton } from "@/components/account/orders-view";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentUser, useMyOrders } from "@/store/hooks";
import { useHydrated } from "@/store/persist";

export function OrderDetailPage({ id }: { id: string }) {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const orders = useMyOrders();
  const order = orders.find((o) => o.id === id);

  if (!hydrated || !user) return <OrdersSkeleton />;
  if (!order) {
    return (
      <EmptyState
        compact
        icon={PackageX}
        title="We couldn't find that order"
        body="Check the order number, or sign in with the account you used to place it."
        actions={
          <Link href="/account/orders" className={buttonVariants({ size: "lg" })}>
            View my orders
          </Link>
        }
      />
    );
  }
  return <OrderDetail order={order} />;
}
