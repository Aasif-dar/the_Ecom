"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PriceDisplay } from "@/components/ui/price-display";
import { RatingStars } from "@/components/ui/rating-stars";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { useUiStore } from "@/store/ui";
import { useProductById } from "@/store/hooks";

export function QuickView() {
  const id = useUiStore((s) => s.quickViewId);
  const close = useUiStore((s) => s.closeQuickView);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const product = useProductById(id);

  return (
    <Dialog open={!!id && !!product} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl p-0 sm:max-w-3xl">
        {product && (
          <div className="grid max-h-[90dvh] overflow-y-auto sm:grid-cols-[0.9fr_1fr]">
            <div className="relative aspect-[4/5] bg-bone sm:aspect-auto sm:min-h-[520px]">
              <Image src={product.images[0]} alt={product.name} fill sizes="(min-width:640px) 360px, 100vw" className="object-cover" />
            </div>
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <DialogTitle className="font-serif text-[1.9rem] leading-[1.05]">{product.name}</DialogTitle>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <PriceDisplay price={product.price} mrp={product.mrp} />
                  {product.reviewCount > 0 && <RatingStars value={product.rating} count={product.reviewCount} size={13} />}
                </div>
                <p className="mt-4 text-[0.875rem] leading-relaxed text-graphite">{product.shortDescription}</p>
              </div>
              <PurchasePanel
                product={product}
                compact
                onAdded={() => {
                  close();
                  setCartOpen(true);
                }}
              />
              <Link href={`/product/${product.slug}`} onClick={close} className="inline-flex items-center gap-1.5 self-start border-b border-ink/40 pb-0.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:border-ink">
                Full details <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
