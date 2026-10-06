import type { SiteContent } from "@/types";

export const SEED_CONTENT: SiteContent = {
  announcements: [
    "Free shipping on orders above ₹2,999",
    "The Utsav Edit is live. Use FESTIVE15 for 15% off",
    "7-day easy returns. Cash on delivery available",
  ],
  hero: {
    id: "hero_1",
    eyebrow: "The Utsav Edit · Now live",
    title: "Crafted for",
    titleAccent: "your everyday.",
    body: "Considered silhouettes, honest fabrics and a festive edit made for the way you actually live. Small runs, made in India.",
    primaryCta: { label: "Shop Collection", href: "/shop" },
    secondaryCta: { label: "Explore New Arrivals", href: "/shop/new-arrivals" },
    imageMain: "/images/editorial/hero-main.jpg",
    imageSide: "/images/editorial/hero-side.jpg",
    active: true,
  },
  promo: {
    id: "promo_1",
    eyebrow: "The Festive Sale",
    title: "Up to 40% off",
    body: "Selected styles across knitwear, outerwear and leather goods. Limited time, limited stock.",
    cta: { label: "Shop the sale", href: "/shop/sale" },
    image: "/images/editorial/promo.jpg",
    active: true,
  },
  featuredProductIds: [],
  sections: [
    { id: "categories", label: "Featured categories", enabled: true },
    { id: "new-arrivals", label: "New arrivals", enabled: true },
    { id: "promo", label: "Promotional banner", enabled: true },
    { id: "best-sellers", label: "Best sellers", enabled: true },
    { id: "collections", label: "Collections", enabled: true },
    { id: "story", label: "Brand story", enabled: true },
    { id: "instagram", label: "Instagram gallery", enabled: true },
    { id: "newsletter", label: "Newsletter", enabled: true },
  ],
  offers: [
    { id: "offer_1", title: "Welcome offer", description: "10% off your first order above ₹1,499.", code: "WELCOME10", badge: "New customers", href: "/shop", active: true },
    { id: "offer_2", title: "Festive 15", description: "15% off orders above ₹3,999 across The Utsav Edit.", code: "FESTIVE15", badge: "Limited time", href: "/collections/utsav", active: true },
    { id: "offer_3", title: "Flat ₹500 off", description: "On orders above ₹4,999. Stacks with sale prices.", code: "FLAT500", badge: "Everyone", href: "/shop", active: true },
    { id: "offer_4", title: "The Big Edit", description: "Up to 40% off winter outerwear, knits and leather.", badge: "Up to 40% off", href: "/shop/sale", active: true },
  ],
};
