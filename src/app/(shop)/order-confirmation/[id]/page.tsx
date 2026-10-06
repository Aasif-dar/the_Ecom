import type { Metadata } from "next";
import { ConfirmationView } from "@/components/checkout/confirmation-view";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

export default async function ConfirmationPage({ params }: PageProps<"/order-confirmation/[id]">) {
  const { id } = await params;
  return <ConfirmationView id={id} />;
}
