"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { ProductGrid } from "@/components/product/product-grid";
import { LOW_STOCK_THRESHOLD, totalStock } from "@/lib/product-utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useCatalogStore } from "@/store/catalog";
import { useUiStore } from "@/store/ui";
import { useWishlistStore } from "@/store/wishlist";
import { useActiveProducts } from "@/store/hooks";

function WishlistCard({ product }: { product: Product }) {
  const remove = useWishlistStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.add);
  const openQuickView = useUiStore((s) => s.openQuickView);
  const pulse = useUiStore((s) => s.pulseCart);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const stock = totalStock(product);
  const sub = useCatalogStore((s) => s.categories).flatMap((c) => c.subcategories).find((s) => s.id === product.subcategoryId);

  const moveToBag = () => {
    // one colour and one size: add straight away. Otherwise let the shopper choose.
    if (product.colors.length === 1 && product.sizes.length === 1) {
      const res = addToCart({ productId: product.id, color: product.colors[0].name, size: product.sizes[0], quantity: 1 });
      if (!res.ok) return toast.error(res.error);
      remove(product.id);
      pulse();
      setCartOpen(true);
      toast.success("Moved to your bag", { description: product.name });
    } else {
      openQuickView(product.id);
    }
  };

  return (
    <li className="group/w relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          <Image src={product.images[0]} alt={product.name} fill sizes="(min-width:1024px) 22vw, 46vw" className={cn("object-cover transition-transform duration-[900ms] group-hover/w:scale-[1.03]", stock <= 0 && "opacity-60")} />
        </Link>
        <button
          type="button"
          aria-label={`Remove ${product.name} from wishlist`}
          onClick={() => {
            remove(product.id);
            toast("Removed from wishlist", { description: product.name });
          }}
          className="absolute right-3 top-3 grid size-9 place-items-center bg-paper/90 transition-colors hover:bg-paper"
        >
          <X className="size-4" />
        </button>
        {stock <= 0 && <span className="absolute left-0 top-3 bg-ink px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-paper">Sold out</span>}
      </div>
      <div className="pt-3.5">
        <p className="eyebrow mb-1.5 text-[0.625rem] text-stone">{sub?.name}</p>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-[0.9375rem] leading-snug hover:text-clay">
          {product.name}
        </Link>
        <PriceDisplay price={product.price} mrp={product.mrp} className="mt-1.5" />
        <p className={cn("mt-2 text-[0.8125rem] font-medium", stock <= 0 ? "text-danger" : stock <= LOW_STOCK_THRESHOLD ? "text-clay" : "text-success")}>
          {stock <= 0 ? "Currently unavailable" : stock <= LOW_STOCK_THRESHOLD ? `Only ${stock} left` : "In stock"}
        </p>
        <Button variant="outline" size="sm" className="mt-4 w-full" disabled={stock <= 0} onClick={moveToBag}>
          <ShoppingBag className="size-3.5" /> Move to bag
        </Button>
      </div>
    </li>
  );
}

export function WishlistView({ embedded = false }: { embedded?: boolean }) {
  const items = useWishlistStore((s) => s.items);
  const clear = useWishlistStore((s) => s.clear);
  const products = useCatalogStore((s) => s.products);
  const active = useActiveProducts();
  const suggestions = useMemo(() => active.filter((p) => p.isBestSeller).slice(0, 4), [active]);

  const wished = useMemo(
    () => items.map((i) => products.find((p) => p.id === i.productId)).filter((p): p is Product => !!p && p.status === "active"),
    [items, products],
  );

  const inner =
    wished.length === 0 ? (
      <>
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          body="Tap the heart on anything you love and it will wait for you here, even after you close the tab."
          actions={
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              Explore the collection
            </Link>
          }
        />
        {!embedded && (
          <div className="mt-8 border-t border-line pt-14">
            <h2 className="display-md mb-8">
              Start with our <em className="font-serif italic">best sellers</em>
            </h2>
            <ProductGrid products={suggestions} />
          </div>
        )}
      </>
    ) : (
      <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3", embedded ? "xl:grid-cols-3" : "xl:grid-cols-4")}>
        {wished.map((p) => (
          <WishlistCard key={p.id} product={p} />
        ))}
      </ul>
    );

  if (embedded) return inner;

  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} className="mb-6" />
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
        <h1 className="display-lg">
          Wishlist{wished.length > 0 && <span className="ml-3 align-top font-sans text-base text-stone">({wished.length})</span>}
        </h1>
        {wished.length > 0 && (
          <button type="button" onClick={clear} className="text-[0.8125rem] text-stone underline underline-offset-4 hover:text-ink">
            Clear wishlist
          </button>
        )}
      </div>
      {inner}
    </div>
  );
}
