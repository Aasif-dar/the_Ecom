"use client";

import { Hero } from "@/components/home/hero";
import { CategoryMosaic } from "@/components/home/category-mosaic";
import { ProductShowcase } from "@/components/home/product-showcase";
import { PromoBanner } from "@/components/home/promo-banner";
import { CollectionsList } from "@/components/home/collections-list";
import { BrandStory } from "@/components/home/brand-story";
import { InstagramGrid } from "@/components/home/instagram-grid";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { useSiteStore } from "@/store/site";

/** Renders the homepage in the order and visibility the admin chose in Content management. */
export function HomeSections() {
  const sections = useSiteStore((s) => s.content.sections);
  return (
    <>
      <Hero />
      {sections
        .filter((s) => s.enabled)
        .map((s) => {
          switch (s.id) {
            case "categories":
              return <CategoryMosaic key={s.id} />;
            case "new-arrivals":
              return <ProductShowcase key={s.id} kind="new" />;
            case "promo":
              return <PromoBanner key={s.id} />;
            case "best-sellers":
              return <ProductShowcase key={s.id} kind="best" />;
            case "collections":
              return <CollectionsList key={s.id} />;
            case "story":
              return <BrandStory key={s.id} />;
            case "instagram":
              return <InstagramGrid key={s.id} />;
            case "newsletter":
              return <NewsletterSection key={s.id} />;
            default:
              return null;
          }
        })}
    </>
  );
}
