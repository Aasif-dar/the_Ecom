"use client";

import { useMemo } from "react";
import type { Product } from "@/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { useActiveProducts } from "@/store/hooks";

export function RelatedProducts({ product }: { product: Product }) {
  const products = useActiveProducts();
  const related = useMemo(() => {
    const others = products.filter((p) => p.id !== product.id);
    const sameSub = others.filter((p) => p.subcategoryId === product.subcategoryId);
    const sameCat = others.filter((p) => p.categoryId === product.categoryId && p.subcategoryId !== product.subcategoryId);
    const sharedTags = (p: Product) => p.tags.filter((t) => product.tags.includes(t)).length;
    const rank = (arr: Product[]) => [...arr].sort((a, b) => sharedTags(b) - sharedTags(a) || b.unitsSold - a.unitsSold);
    return [...rank(sameSub), ...rank(sameCat)].slice(0, 4);
  }, [products, product]);

  if (!related.length) return null;
  return (
    <section aria-label="You may also like">
      <SectionHeading eyebrow="Complete the look" title="You may also" accent="like" className="mb-10" />
      <ProductGrid products={related} />
    </section>
  );
}
