import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the items in your Aadyam shopping bag and proceed to checkout.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
