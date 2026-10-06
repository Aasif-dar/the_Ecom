"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PackageX, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Accordion } from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { RatingStars } from "@/components/ui/rating-stars";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { DeliveryChecker } from "@/components/product/delivery-checker";
import { ReviewSection } from "@/components/product/review-section";
import { RelatedProducts } from "@/components/product/related-products";
import { ProductDetailSkeleton } from "@/components/product/product-skeleton";
import { SizeGuideDialog } from "@/components/product/size-guide";
import { formatINR } from "@/lib/format";
import { discountPercent } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, totalStock } from "@/lib/product-utils";
import { cn } from "@/lib/utils";
import { useProductBySlug } from "@/store/hooks";
import { useCatalogStore } from "@/store/catalog";
import { useHydrated } from "@/store/persist";
import { useSiteStore } from "@/store/site";

export function ProductView({ slug }: { slug: string }) {
  const product = useProductBySlug(slug);
  const hydrated = useHydrated();

  if (!product && !hydrated) return <ProductDetailSkeleton />;
  if (!product || product.status === "archived") {
    return (
      <div className="container-x">
        <EmptyState
          icon={PackageX}
          title="This product isn't available"
          body="It may have sold out for good or been removed from the range. Have a look at what else is new."
          actions={
            <>
              <Link href="/shop" className={buttonVariants({ size: "lg" })}>
                Continue shopping
              </Link>
              <Link href="/shop/new-arrivals" className={buttonVariants({ variant: "outline", size: "lg" })}>
                New arrivals
              </Link>
            </>
          }
        />
      </div>
    );
  }
  return <ProductDetail product={product} preview={product.status === "draft"} />;
}

function ProductDetail({ product, preview }: { product: Product; preview: boolean }) {
  const categories = useCatalogStore((s) => s.categories);
  const store = useSiteStore((s) => s.settings.store);
  const category = categories.find((c) => c.id === product.categoryId);
  const sub = category?.subcategories.find((s) => s.id === product.subcategoryId);
  const stock = totalStock(product);
  const pct = discountPercent(product.price, product.mrp);
  const panelRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  // mobile: show a sticky buy bar once the purchase panel has scrolled out of view
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const badge = (
    <span className="flex flex-col items-start gap-1">
      {product.isNew && <span className="bg-paper px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em]">New</span>}
      {pct >= 20 && <span className="bg-clay px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-paper">−{pct}%</span>}
    </span>
  );

  return (
    <article className="container-x pb-8 pt-6 sm:pt-8">
      {preview && <p className="mb-5 border border-warning/40 bg-warning/10 px-4 py-2.5 text-[0.8125rem] text-warning">Draft preview. This product is not yet visible to customers.</p>}
      <Breadcrumb
        className="mb-6 sm:mb-8"
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(category ? [{ label: category.name, href: `/shop/${category.slug}` }] : []),
          ...(sub && category ? [{ label: sub.name, href: `/shop/${category.slug}?sub=${sub.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1.12fr_1fr] lg:gap-16 xl:gap-24">
        <div className="lg:self-start lg:sticky lg:top-28">
          <ProductGallery images={product.images} name={product.name} badge={badge} />
        </div>

        <div className="min-w-0">
          <div ref={panelRef}>
            <p className="eyebrow mb-4 text-clay">{sub?.name ?? category?.name}</p>
            <h1 className="display-md">{product.name}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              {product.reviewCount > 0 ? (
                <a href="#reviews" className="inline-flex items-center gap-3 text-[0.8125rem] text-graphite hover:text-ink">
                  <RatingStars value={product.rating} size={15} showValue />
                  <span className="underline underline-offset-4">{product.reviewCount} reviews</span>
                </a>
              ) : (
                <span className="text-[0.8125rem] text-stone">No reviews yet</span>
              )}
              <span className="text-[0.75rem] uppercase tracking-[0.12em] text-stone">SKU {product.sku}</span>
            </div>

            <div className="mt-6">
              <PriceDisplay price={product.price} mrp={product.mrp} size="lg" />
              <p className="mt-1.5 text-[0.8125rem] text-stone">Inclusive of all taxes{store.freeShippingAbove ? ` · Free shipping above ${formatINR(store.freeShippingAbove)}` : ""}</p>
            </div>

            <p className="mt-6 text-[1rem] leading-relaxed text-graphite">{product.shortDescription}</p>

            <p className={cn("mt-5 text-[0.8125rem] font-medium", stock <= 0 ? "text-danger" : stock <= LOW_STOCK_THRESHOLD ? "text-clay" : "text-success")}>
              {stock <= 0 ? "Sold out" : stock <= LOW_STOCK_THRESHOLD ? `Only ${stock} left. Order soon.` : "In stock · Ships within 24 hours"}
            </p>

            <div className="mt-8">
              <PurchasePanel product={product} />
            </div>
          </div>

          <ul className="mt-9 grid grid-cols-3 gap-3 border-y border-line py-5 text-center text-[0.75rem] leading-snug text-graphite">
            {[
              { icon: Truck, text: "Free shipping over ₹2,999" },
              { icon: RotateCcw, text: "7-day easy returns" },
              { icon: ShieldCheck, text: "Secure checkout" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex flex-col items-center gap-2">
                <Icon className="size-5" strokeWidth={1.25} />
                {text}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <DeliveryChecker />
          </div>

          <Accordion
            className="mt-9"
            defaultOpen="description"
            items={[
              {
                id: "description",
                title: "Description",
                content: (
                  <div className="space-y-4">
                    {product.description.split("\n\n").map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ),
              },
              {
                id: "details",
                title: "Product details",
                content: (
                  <ul className="space-y-2.5">
                    {product.details.map((d) => {
                      const [k, ...rest] = d.split(": ");
                      return (
                        <li key={d} className="flex gap-3 border-b border-line/70 pb-2.5 last:border-0">
                          {rest.length ? (
                            <>
                              <span className="w-20 shrink-0 text-stone">{k}</span>
                              <span>{rest.join(": ")}</span>
                            </>
                          ) : (
                            <span>{d}</span>
                          )}
                        </li>
                      );
                    })}
                    <li className="pt-1">
                      <SizeGuideDialog kind={product.sizeGuide} />
                    </li>
                  </ul>
                ),
              },
              {
                id: "shipping",
                title: "Shipping & delivery",
                content: (
                  <ul className="list-disc space-y-2 pl-5 marker:text-stone">
                    <li>Free standard shipping on orders above {formatINR(store.freeShippingAbove)}; otherwise {formatINR(store.shippingFee)}.</li>
                    <li>Metro cities: 3–4 working days. Rest of India: 5–7 working days.</li>
                    <li>Orders are packed within 24 hours in recyclable, plastic-free packaging.</li>
                    {store.codEnabled && <li>Cash on delivery is available for a {formatINR(store.codFee)} handling fee.</li>}
                    <li>
                      Track your order any time from <Link href="/track-order" className="underline underline-offset-4">Track order</Link>.
                    </li>
                  </ul>
                ),
              },
              {
                id: "returns",
                title: "Returns & exchanges",
                content: (
                  <ul className="list-disc space-y-2 pl-5 marker:text-stone">
                    <li>Return or exchange within 7 days of delivery, unworn and with tags attached.</li>
                    <li>Free reverse pick-up on size exchanges. Refunds reach you in 3–5 working days.</li>
                    <li>Innerwear, jewellery and personalised items can't be returned for hygiene reasons.</li>
                    <li>
                      Read the full <Link href="/returns" className="underline underline-offset-4">returns policy</Link>.
                    </li>
                  </ul>
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-24 sm:mt-32">
        <ReviewSection product={product} />
      </div>
      <div className="mt-24 sm:mt-32">
        <RelatedProducts product={product} />
      </div>

      {/* mobile sticky buy bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-paper px-4 py-3 shadow-[0_-10px_30px_-20px_rgba(20,17,15,0.4)] transition-transform duration-500 ease-out lg:hidden",
          showBar && stock > 0 ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showBar}
      >
        <div className="min-w-0">
          <p className="truncate text-[0.8125rem] text-graphite">{product.name}</p>
          <PriceDisplay price={product.price} mrp={product.mrp} size="sm" showPercent={false} />
        </div>
        <Button size="default" onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })} tabIndex={showBar ? 0 : -1}>
          Choose size
        </Button>
      </div>
    </article>
  );
}
