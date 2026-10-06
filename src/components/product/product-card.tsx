"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { discountPercent } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, totalStock } from "@/lib/product-utils";
import { PriceDisplay } from "@/components/ui/price-display";
import { RatingStars } from "@/components/ui/rating-stars";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useUiStore } from "@/store/ui";
import { useCatalogStore } from "@/store/catalog";

export const PRODUCT_CARD_SIZES = "(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw";

function ProductCardBase({ product, priority = false, className, showMeta = true }: { product: Product; priority?: boolean; className?: string; showMeta?: boolean }) {
  const openQuickView = useUiStore((s) => s.openQuickView);
  const categories = useCatalogStore((s) => s.categories);
  const stock = totalStock(product);
  const soldOut = stock <= 0;
  const pct = discountPercent(product.price, product.mrp);
  const href = `/product/${product.slug}`;
  const sub = categories.flatMap((c) => c.subcategories).find((s) => s.id === product.subcategoryId);
  const hasAlt = product.images.length > 1;

  const badge = soldOut ? "Sold out" : product.isNew ? "New" : pct >= 25 ? `−${pct}%` : product.isBestSeller ? "Best seller" : null;

  return (
    <article className={cn("group/card relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Link href={href} aria-label={product.name} className="absolute inset-0 block outline-offset-[-3px]">
          <Image
            src={product.images[0]}
            alt={`${product.name} in ${product.colors[0]?.name ?? "signature colour"}`}
            fill
            sizes={PRODUCT_CARD_SIZES}
            priority={priority}
            className={cn(
              "object-cover transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]",
              hasAlt ? "group-hover/card:opacity-0" : "group-hover/card:scale-[1.04]",
              soldOut && "opacity-70",
            )}
          />
          {hasAlt && (
            <Image
              src={product.images[1]}
              alt=""
              fill
              sizes={PRODUCT_CARD_SIZES}
              className="object-cover opacity-0 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover/card:scale-[1.03] group-hover/card:opacity-100"
            />
          )}
        </Link>

        {badge && (
          <span
            className={cn(
              "pointer-events-none absolute left-0 top-3 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em]",
              soldOut ? "bg-ink text-paper" : badge.startsWith("−") ? "bg-clay text-paper" : "bg-paper text-ink",
            )}
          >
            {badge}
          </span>
        )}

        <WishlistButton productId={product.id} productName={product.name} className="absolute right-3 top-3" />

        {!soldOut && (
          <button
            type="button"
            onClick={() => openQuickView(product.id)}
            className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-paper/95 py-3.5 text-center text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-ink hover:text-paper focus-visible:translate-y-0 group-hover/card:translate-y-0 md:block"
          >
            Quick add
          </button>
        )}
      </div>

      {showMeta && (
        <div className="flex flex-1 flex-col pt-3.5">
          <p className="eyebrow mb-1.5 text-[0.625rem] text-stone">{sub?.name ?? ""}</p>
          <h3 className="font-sans text-[0.9375rem] font-normal leading-snug tracking-normal text-ink">
            <Link href={href} className="line-clamp-2 transition-colors hover:text-clay">
              {product.name}
            </Link>
          </h3>
          <PriceDisplay price={product.price} mrp={product.mrp} className="mt-1.5" />
          <div className="mt-2 flex items-center justify-between gap-2">
            {product.reviewCount > 0 ? <RatingStars value={product.rating} count={product.reviewCount} size={12} /> : <span />}
            {!soldOut && stock <= LOW_STOCK_THRESHOLD && <span className="text-[0.6875rem] font-medium text-clay">Only {stock} left</span>}
          </div>
          {product.colors.length > 1 && (
            <div className="mt-2.5 flex items-center gap-1.5" aria-label={`${product.colors.length} colours available`}>
              {product.colors.slice(0, 5).map((c) => (
                <span key={c.name} title={c.name} className="size-3 rounded-full border border-ink/15" style={{ background: c.hex }} />
              ))}
              {product.colors.length > 5 && <span className="text-[0.6875rem] text-stone">+{product.colors.length - 5}</span>}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
