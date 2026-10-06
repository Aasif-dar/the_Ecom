import type { Metadata } from "next";
import { AccountHeading } from "@/components/account/account-shell";
import { WishlistView } from "@/components/account/wishlist-view";

export const metadata: Metadata = { title: "Wishlist" };

export default function Page() {
  return (
    <>
      <AccountHeading eyebrow="Account" title="Your" accent="wishlist" />
      <WishlistView embedded />
    </>
  );
}
