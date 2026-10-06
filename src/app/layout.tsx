import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BRAND } from "@/lib/brand";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.displayName} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.displayName}`,
  },
  description: BRAND.description,
  applicationName: BRAND.displayName,
  keywords: ["Indian fashion", "kurta", "linen shirts", "denim", "leather goods", "festive wear", "AADYAM"],
  openGraph: {
    type: "website",
    siteName: BRAND.displayName,
    title: `${BRAND.displayName} | ${BRAND.tagline}`,
    description: BRAND.description,
    locale: "en_IN",
    images: [{ url: "/images/editorial/hero-main.jpg", width: 1400, height: 1750, alt: `${BRAND.displayName} festive edit` }],
  },
  twitter: { card: "summary_large_image", title: `${BRAND.displayName} | ${BRAND.tagline}`, description: BRAND.description },
};

export const viewport: Viewport = {
  themeColor: "#f6f2ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
