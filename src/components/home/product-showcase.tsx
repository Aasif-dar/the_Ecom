"use client";

import { useMemo } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { useActiveProducts } from "@/store/hooks";
import { useSiteStore } from "@/store/site";

type Kind = "new" | "best";

export function ProductShowcase({ kind }: { kind: Kind }) {
  const products = useActiveProducts();
  const featured = useSiteStore((s) => s.content.featuredProductIds);

  const list = useMemo(() => {
    if (kind === "new") {
      return products
        .filter((p) => p.isNew)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 8);
    }
    const pinned = featured.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
    const rest = products
      .filter((p) => p.isBestSeller && !featured.includes(p.id))
      .sort((a, b) => b.unitsSold - a.unitsSold);
    return [...pinned, ...rest].slice(0, 8);
  }, [products, featured, kind]);

  const copy =
    kind === "new"
      ? { eyebrow: "Just landed", title: "New", accent: "arrivals", href: "/shop/new-arrivals" }
      : { eyebrow: "Loved most", title: "Best", accent: "sellers", href: "/shop/best-sellers" };

  if (list.length === 0) return null;

  return (
    <section aria-label={`${copy.title} ${copy.accent}`} className="container-x pt-20 sm:pt-28">
      <Reveal>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} accent={copy.accent} href={copy.href} className="mb-10 sm:mb-14" />
      </Reveal>
      <Reveal delay={0.1}>
        <ProductGrid products={list} />
      </Reveal>
    </section>
  );
}
