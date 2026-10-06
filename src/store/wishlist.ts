"use client";

import type { WishlistItem } from "@/types";
import { createPersisted } from "./persist";

interface WishlistState {
  items: WishlistItem[];
  toggle: (productId: string) => boolean; // returns new "wished" state
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = createPersisted<WishlistState>("wishlist", (set, get) => ({
  items: [],
  toggle: (productId) => {
    const has = get().items.some((i) => i.productId === productId);
    set((s) => ({
      items: has ? s.items.filter((i) => i.productId !== productId) : [{ productId, addedAt: new Date().toISOString() }, ...s.items],
    }));
    return !has;
  },
  remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
  clear: () => set({ items: [] }),
}));

export const useIsWished = (productId: string) => useWishlistStore((s) => s.items.some((i) => i.productId === productId));
