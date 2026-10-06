import type { Metadata } from "next";
import { TrackOrderView } from "@/components/account/track-order-view";

export const metadata: Metadata = { title: "Track your order", description: "Check the live status of your Aadyam order with your order number.", alternates: { canonical: "/track-order" } };

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
