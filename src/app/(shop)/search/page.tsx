import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/shop-view";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q : "";
  return {
    title: term ? `Search: ${term}` : "Search",
    description: term ? `Search results for “${term}” at Aadyam.` : "Search the Aadyam range.",
    robots: { index: false, follow: true },
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopView mode="search" title="Search" breadcrumb={[{ label: "Home", href: "/" }, { label: "Search" }]} />
    </Suspense>
  );
}
