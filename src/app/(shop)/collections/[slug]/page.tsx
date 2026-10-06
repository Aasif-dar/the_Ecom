import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/shop-view";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import { COLLECTIONS } from "@/data/categories";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = COLLECTIONS.find((x) => x.slug === slug);
  if (!c) return { title: "Collection not found" };
  return {
    title: c.name,
    description: c.description,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { title: `${c.name} | Aadyam`, description: c.description, images: [{ url: c.image }] },
  };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const c = COLLECTIONS.find((x) => x.slug === slug);
  if (!c) notFound();
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopView
        base={{ collection: c.slug }}
        banner={c.image}
        eyebrow={c.tagline}
        title={c.name}
        description={c.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Collections", href: "/collections" }, { label: c.name }]}
      />
    </Suspense>
  );
}
