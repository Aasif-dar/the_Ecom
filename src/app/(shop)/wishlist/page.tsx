import type { Metadata } from "next";
import { WishlistView } from "@/components/account/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "The pieces you've saved for later.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistView />;
}
