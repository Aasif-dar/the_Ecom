import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/shop/shop-view";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";
import { SEED_CATEGORIES } from "@/data/categories";
import { SPECIAL_ROUTES, type SpecialCollection } from "@/lib/filter";

const SPECIALS = Object.keys(SPECIAL_ROUTES) as SpecialCollection[];

const CATEGORY_TITLES: Record<string, string> = {
  women: "Women's clothing & ethnic wear",
  men: "Men's clothing, kurtas & tailoring",
  footwear: "Footwear",
  accessories: "Bags, eyewear & jewellery",
};

export function generateStaticParams() {
  return [...SEED_CATEGORIES.map((c) => ({ category: c.slug })), ...SPECIALS.map((s) => ({ category: s }))];
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const special = SPECIALS.find((s) => s === category);
  if (special) {
    const { title, blurb } = SPECIAL_ROUTES[special];
    return { title, description: blurb, alternates: { canonical: `/shop/${special}` }, openGraph: { title: `${title} | Aadyam`, description: blurb } };
  }
  const cat = SEED_CATEGORIES.find((c) => c.slug === category);
  if (!cat) return { title: "Shop" };
  return {
    title: CATEGORY_TITLES[cat.slug] ?? cat.name,
    description: cat.description,
    alternates: { canonical: `/shop/${cat.slug}` },
    openGraph: { title: `${cat.name} | Aadyam`, description: cat.description },
  };
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const special = SPECIALS.find((s) => s === category);

  if (special) {
    const meta = SPECIAL_ROUTES[special];
    return (
      <Suspense fallback={<ShopSkeleton />}>
        <ShopView
          base={{ special }}
          title={meta.title}
          eyebrow={special === "sale" ? "Limited time" : "Curated"}
          description={meta.blurb}
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: meta.title }]}
        />
      </Suspense>
    );
  }

  const seeded = SEED_CATEGORIES.find((c) => c.slug === category);
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopView
        base={{ category }}
        fixedCategory
        title={seeded?.name ?? category.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())}
        eyebrow="Shop"
        description={seeded?.description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: seeded?.name ?? category }]}
      />
    </Suspense>
  );
}
