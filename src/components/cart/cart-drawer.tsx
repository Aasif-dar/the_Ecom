"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { ShippingProgress } from "@/components/cart/shipping-progress";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui";
import { useCartDetailed } from "@/store/hooks";
import { useSiteStore } from "@/store/site";

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const setOpen = useUiStore((s) => s.setCartOpen);
  const { lines, totals, count } = useCartDetailed();
  const threshold = useSiteStore((s) => s.settings.store.freeShippingAbove);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right">
        <SheetHeader className="border-b pr-16">
          <SheetTitle>
            Your bag <span className="ml-1 font-sans text-sm tabular-nums text-stone">({count})</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Review the items in your shopping bag</SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <EmptyState
              compact
              icon={ShoppingBag}
              title="Your bag is empty"
              body="Fill it with something you'll reach for every day."
              actions={
                <Link href="/shop" onClick={close} className={buttonVariants({ size: "lg" })}>
                  Start shopping
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <div className="px-6 pt-5">
              <ShippingProgress remaining={totals.amountToFreeShipping} threshold={threshold} />
            </div>
            <ul className="thin-scroll flex-1 divide-y divide-line overflow-y-auto px-6" aria-label="Items in your bag">
              {lines.map((line) => (
                <CartItemRow key={line.item.id} line={line} variant="drawer" onNavigate={close} />
              ))}
            </ul>
            <div className="border-t bg-paper-2 p-6">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Subtotal</span>
                <span className="font-serif text-[1.6rem] tabular-nums">{formatINR(totals.subtotal - totals.productSavings)}</span>
              </div>
              {totals.productSavings > 0 && <p className="mb-1 text-right text-[0.8125rem] text-success">You're saving {formatINR(totals.productSavings)}</p>}
              <p className="mb-5 text-[0.8125rem] text-stone">Shipping, taxes and offers are calculated at checkout.</p>
              <div className="grid gap-3">
                <Link href="/checkout" onClick={close} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                  Checkout
                </Link>
                <Link href="/cart" onClick={close} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
                  View bag
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
