import type { Metadata } from "next";
import { HomeSections } from "@/components/home/home-sections";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { absolute: `${BRAND.displayName} | ${BRAND.tagline}` },
  description: BRAND.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: BRAND.displayName,
            url: BRAND.siteUrl,
            logo: `${BRAND.siteUrl}/icon.svg`,
            sameAs: [`https://instagram.com/${BRAND.instagram}`],
          }),
        }}
      />
      <HomeSections />
    </>
  );
}
