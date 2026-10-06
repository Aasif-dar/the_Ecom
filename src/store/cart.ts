"use client";

import type { CartItem } from "@/types";
import { createPersisted } from "./persist";
import { useCatalogStore } from "./catalog";
import { cartLineId, variantStock } from "@/lib/product-utils";

export type AddResult = { ok: true; quantity: number; capped: boolean } | { ok: false; error: string };

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  add: (input: { productId: string; color: string; size: string; quantity?: number }) => AddResult;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => CartItem | undefined;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
}

export const useCartStore = createPersisted<CartState>("cart", (set, get) => ({
  items: [],
  couponCode: null,

  add: ({ productId, color, size, quantity = 1 }) => {
    const product = useCatalogStore.getState().products.find((p) => p.id === productId);
    if (!product) return { ok: false, error: "This product is no longer available." };
    const stock = variantStock(product, color, size);
    if (stock <= 0) return { ok: false, error: "That size is currently sold out." };
    const id = cartLineId(productId, color, size);
    const existing = get().items.find((i) => i.id === id);
    const desired = (existing?.quantity ?? 0) + quantity;
    const next = Math.min(desired, stock, 10);
    const capped = next < desired;
    if (existing) {
      set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, quantity: next } : i)) }));
    } else {
      set((s) => ({ items: [{ id, productId, color, size, quantity: next, addedAt: new Date().toISOString() }, ...s.items] }));
    }
    return { ok: true, quantity: next, capped };
  },

  setQuantity: (id, quantity) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const product = useCatalogStore.getState().products.find((p) => p.id === item.productId);
    const stock = product ? variantStock(product, item.color, item.size) : 10;
    const q = Math.max(1, Math.min(quantity, stock || 1, 10));
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, quantity: q } : i)) }));
  },

  remove: (id) => {
    const item = get().items.find((i) => i.id === id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    return item;
  },

  clear: () => set({ items: [], couponCode: null }),
  applyCoupon: (code) => set({ couponCode: code.trim().toUpperCase() }),
  removeCoupon: () => set({ couponCode: null }),
}));
