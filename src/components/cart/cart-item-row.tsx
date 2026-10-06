"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { PriceDisplay } from "@/components/ui/price-display";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import type { DetailedCartLine } from "@/store/hooks";

export function CartItemRow({ line, variant = "page", onNavigate }: { line: DetailedCartLine; variant?: "drawer" | "page"; onNavigate?: () => void }) {
  const { item, product, stock } = line;
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.items.some((i) => i.productId === product.id));
  const soldOut = stock <= 0;
  const over = !soldOut && item.quantity > stock;
  const href = `/product/${product.slug}`;
  const drawer = variant === "drawer";

  const onRemove = () => {
    const removed = remove(item.id);
    toast("Removed from your bag", {
      description: product.name,
      action: removed ? { label: "Undo", onClick: () => useCartStore.setState((s) => ({ items: [removed, ...s.items] })) } : undefined,
    });
  };

  const onMoveToWishlist = () => {
    if (!wished) wishlistToggle(product.id);
    remove(item.id);
    toast.success("Moved to your wishlist", { description: product.name });
  };

  return (
    <li className={cn("flex gap-4", drawer ? "py-5" : "py-6 sm:gap-6")}>
      <Link href={href} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden bg-bone", drawer ? "h-[104px] w-[84px]" : "h-[132px] w-[106px] sm:h-[176px] sm:w-[140px]")}>
        <Image src={product.images[0]} alt={product.name} fill sizes="140px" className={cn("object-cover", soldOut && "opacity-60")} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} onClick={onNavigate} className="line-clamp-2 text-[0.9375rem] leading-snug text-ink hover:text-clay">
              {product.name}
            </Link>
            <p className="mt-1 text-[0.8125rem] text-stone">
              {item.color}
              {item.size !== "One Size" && <> · Size {item.size}</>}
            </p>
          </div>
          {!drawer && <p className="shrink-0 text-[0.9375rem] font-medium tabular-nums">{formatINR(line.unitPrice * item.quantity)}</p>}
        </div>

        {soldOut ? (
          <p className="mt-2 text-[0.8125rem] font-medium text-danger">This size is now sold out. Remove it to continue.</p>
        ) : over ? (
          <p className="mt-2 text-[0.8125rem] font-medium text-danger">Only {stock} left. Please reduce the quantity.</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-3">
          <div className="flex items-center gap-4">
            {!soldOut && <QuantityStepper size="sm" value={item.quantity} max={Math.min(stock, 10)} onChange={(q) => setQuantity(item.id, q)} />}
            {drawer && <PriceDisplay price={line.unitPrice * item.quantity} size="sm" />}
          </div>
          <div className="flex items-center gap-4 text-[0.75rem] uppercase tracking-[0.12em] text-stone">
            {!drawer && (
              <button type="button" onClick={onMoveToWishlist} className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
                <Heart className="size-3.5" /> <span className="hidden sm:inline">Move to wishlist</span>
                <span className="sm:hidden">Save</span>
              </button>
            )}
            <button type="button" onClick={onRemove} aria-label={`Remove ${product.name}`} className="inline-flex items-center gap-1.5 transition-colors hover:text-danger">
              <Trash2 className="size-3.5" /> {!drawer && "Remove"}
            </button>
          </div>
        </div>
        {!drawer && line.unitMrp > line.unitPrice && (
          <div className="mt-2">
            <PriceDisplay price={line.unitPrice} mrp={line.unitMrp} size="sm" />
          </div>
        )}
      </div>
    </li>
  );
}
