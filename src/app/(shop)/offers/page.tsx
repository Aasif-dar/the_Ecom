import type { Metadata } from "next";
import { OffersView } from "@/components/shop/offers-view";

export const metadata: Metadata = {
  title: "Offers & codes",
  description: "Current Aadyam offers: welcome discount, festive codes and up to 40% off the sale edit.",
  alternates: { canonical: "/offers" },
};

export default function OffersPage() {
  return <OffersView />;
}
