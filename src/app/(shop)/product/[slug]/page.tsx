import type { Metadata } from "next";
import { ProductView } from "@/components/product/product-view";
import { SEED } from "@/data/seed";
import { BRAND } from "@/lib/brand";

export function generateStaticParams() {
  return SEED.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = SEED.products.find((x) => x.slug === slug);
  if (!p) return { title: "Product", robots: { index: false } };
  const url = `/product/${p.slug}`;
  return {
    title: p.name,
    description: p.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: `${p.name} | ${BRAND.displayName}`,
      description: p.shortDescription,
      url,
      images: [{ url: p.images[0], width: 900, height: 1125, alt: p.name }],
    },
    twitter: { card: "summary_large_image", title: p.name, description: p.shortDescription, images: [p.images[0]] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = SEED.products.find((x) => x.slug === slug);
  const jsonLd = p && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription,
    sku: p.sku,
    image: p.images.map((i) => `${BRAND.siteUrl}${i}`),
    brand: { "@type": "Brand", name: BRAND.displayName },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      availability: p.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${BRAND.siteUrl}/product/${p.slug}`,
    },
    ...(p.reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount } } : {}),
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ProductView slug={slug} />
    </>
  );
}
