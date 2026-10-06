"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, ShoppingBag } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { OrderSummary } from "@/components/cart/order-summary";
import { ShippingProgress } from "@/components/cart/shipping-progress";
import { ProductGrid } from "@/components/product/product-grid";
import { cn } from "@/lib/utils";
import { useCartDetailed, useActiveProducts } from "@/store/hooks";
import { useCartStore } from "@/store/cart";
import { useSiteStore } from "@/store/site";
import { useMemo } from "react";

export function CartView() {
  const router = useRouter();
  const { lines, orphans, totals, count, hasUnavailable } = useCartDetailed();
  const couponCode = useCartStore((s) => s.couponCode);
  const clear = useCartStore((s) => s.clear);
  const remove = useCartStore((s) => s.remove);
  const threshold = useSiteStore((s) => s.settings.store.freeShippingAbove);
  const products = useActiveProducts();
  const suggestions = useMemo(() => products.filter((p) => p.isBestSeller).slice(0, 4), [products]);

  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag" }]} className="mb-6" />
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
        <h1 className="display-lg">
          Your bag{count > 0 && <span className="ml-3 align-top font-sans text-base text-stone">({count})</span>}
        </h1>
        {lines.length > 0 && (
          <button type="button" onClick={clear} className="text-[0.8125rem] text-stone underline underline-offset-4 hover:text-ink">
            Empty bag
          </button>
        )}
      </div>

      {orphans.length > 0 && (
        <div role="alert" className="mb-6 flex items-start gap-3 border border-warning/40 bg-warning/10 p-4 text-[0.875rem] text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            {orphans.length} item{orphans.length > 1 ? "s" : ""} in your bag {orphans.length > 1 ? "are" : "is"} no longer available.{" "}
            <button type="button" className="underline underline-offset-4" onClick={() => orphans.forEach((o) => remove(o.id))}>
              Remove {orphans.length > 1 ? "them" : "it"}
            </button>
          </div>
        </div>
      )}

      {lines.length === 0 ? (
        <>
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            body="Nothing here yet. Start with something from the Utsav Edit, or browse what everyone is buying."
            actions={
              <>
                <Link href="/shop" className={buttonVariants({ size: "lg" })}>
                  Continue shopping
                </Link>
                <Link href="/collections/utsav" className={buttonVariants({ variant: "outline", size: "lg" })}>
                  The Utsav Edit
                </Link>
              </>
            }
          />
          <div className="mt-8 border-t border-line pt-14">
            <h2 className="display-md mb-8">
              Our best <em className="font-serif italic">sellers</em>
            </h2>
            <ProductGrid products={suggestions} />
          </div>
        </>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_25rem] lg:gap-16 xl:grid-cols-[1fr_28rem]">
          <div>
            <ShippingProgress remaining={totals.amountToFreeShipping} threshold={threshold} />
            <ul className="mt-2 divide-y divide-line border-b border-line" aria-label="Items in your bag">
              {lines.map((line) => (
                <CartItemRow key={line.item.id} line={line} />
              ))}
            </ul>
            <Link href="/shop" className="mt-8 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:text-clay">
              ← Continue shopping
            </Link>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <OrderSummary totals={totals} couponCode={couponCode}>
              {hasUnavailable && <p className="mb-3 text-[0.8125rem] text-danger">Some items are unavailable. Please update your bag to continue.</p>}
              <button
                type="button"
                disabled={hasUnavailable}
                onClick={() => router.push("/checkout")}
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                Proceed to checkout <ArrowRight className="size-4" />
              </button>
              <p className="mt-4 text-center text-[0.78rem] text-stone">Secure checkout · UPI, cards, net banking & COD</p>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  );
}
