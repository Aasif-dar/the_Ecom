// Single source of truth for brand identity. Swap these values (and the
// palette tokens in globals.css) to re-skin the storefront for another label.

export const BRAND = {
  name: "AADYAM",
  displayName: "Aadyam",
  tagline: "Crafted for your everyday",
  description:
    "Considered clothing, footwear and accessories for modern India. Honest fabrics, quiet silhouettes and a festive edit made for the way you actually live.",
  instagram: "aadyam.studio",
  email: "care@aadyam.in",
  phone: "+91 80 4123 9087",
  address: "14, Linking Road, Bandra West, Mumbai 400050",
  founded: 2019,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const FREE_SHIPPING_THRESHOLD = 2999;
