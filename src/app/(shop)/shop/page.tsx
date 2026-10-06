import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/shop-view";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Shop the full Aadyam range: kurtas, shirts, dresses, tailoring, footwear and accessories, made in small runs in India.",
  alternates: { canonical: "/shop" },
  openGraph: { title: "Shop all | Aadyam", description: "The full Aadyam range of clothing, footwear and accessories." },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopView
        title="All products"
        eyebrow="The collection"
        description="Everything we make, in one place. Filter by category, size, colour or price."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />
    </Suspense>
  );
}
