"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsWished, useWishlistStore } from "@/store/wishlist";

export function WishlistButton({
  productId,
  productName,
  variant = "overlay",
  className,
}: {
  productId: string;
  productName?: string;
  variant?: "overlay" | "outline";
  className?: string;
}) {
  const wished = useIsWished(productId);
  const toggle = useWishlistStore((s) => s.toggle);
  const [pop, setPop] = useState(0);
  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowWished = toggle(productId);
    if (nowWished) {
      setPop((n) => n + 1);
      toast.success("Saved to your wishlist", {
        description: productName,
        action: { label: "View", onClick: () => router.push("/wishlist") },
      });
    } else {
      toast("Removed from wishlist", { description: productName });
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={wished}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "group/heart grid shrink-0 place-items-center transition-colors",
        variant === "overlay" ? "size-9 bg-paper/85 text-ink hover:bg-paper" : "size-12 border border-line bg-paper-2 hover:border-ink",
        className,
      )}
    >
      <Heart
        key={pop}
        className={cn("size-[1.15rem] transition-colors", wished ? "fill-clay stroke-clay" : "stroke-current", pop > 0 && wished && "animate-heart-pop")}
        strokeWidth={1.5}
      />
    </button>
  );
}

export function WishlistLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Link href="/wishlist" className={className}>
      {children}
    </Link>
  );
}
