"use client";

import { useMemo } from "react";
import type { CartItem, Product, User } from "@/types";
import { useAuthStore } from "./auth";
import { useCatalogStore } from "./catalog";
import { useCartStore } from "./cart";
import { useSiteStore } from "./site";
import { useWishlistStore } from "./wishlist";
import { useOrderStore } from "./orders";
import { computeTotals, validateCoupon, type Totals } from "@/lib/pricing";

export function useCurrentUser(): User | null {
  const users = useAuthStore((s) => s.users);
  const userId = useAuthStore((s) => s.userId);
  return useMemo(() => users.find((u) => u.id === userId) ?? null, [users, userId]);
}

export function useAdminUser(): User | null {
  const users = useAuthStore((s) => s.users);
  const adminId = useAuthStore((s) => s.adminId);
  return useMemo(() => users.find((u) => u.id === adminId) ?? null, [users, adminId]);
}

export function useProductBySlug(slug: string): Product | undefined {
  const products = useCatalogStore((s) => s.products);
  return useMemo(() => products.find((p) => p.slug === slug), [products, slug]);
}

export function useProductById(id: string | null | undefined): Product | undefined {
  const products = useCatalogStore((s) => s.products);
  return useMemo(() => (id ? products.find((p) => p.id === id) : undefined), [products, id]);
}

/** Storefront-visible products (active only) */
export function useActiveProducts(): Product[] {
  const products = useCatalogStore((s) => s.products);
  return useMemo(() => products.filter((p) => p.status === "active"), [products]);
}

export interface DetailedCartLine {
  item: CartItem;
  product: Product;
  stock: number;
  unitPrice: number;
  unitMrp: number;
}

export function useCartDetailed(paymentMethod?: "online" | "cod") {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const products = useCatalogStore((s) => s.products);
  const coupons = useSiteStore((s) => s.coupons);
  const store = useSiteStore((s) => s.settings.store);

  return useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    const lines: DetailedCartLine[] = [];
    const orphans: CartItem[] = [];
    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product || product.status !== "active") {
        orphans.push(item);
        continue;
      }
      const stock = product.variants.find((v) => v.color === item.color && v.size === item.size)?.stock ?? 0;
      lines.push({ item, product, stock, unitPrice: product.price, unitMrp: product.mrp });
    }
    const coupon = couponCode ? coupons.find((c) => c.code === couponCode) : undefined;
    const payable = lines.filter((l) => l.stock > 0);
    const merch = payable.reduce((s, l) => s + l.unitPrice * l.item.quantity, 0);
    const couponCheck = couponCode ? validateCoupon(coupon, merch) : null;
    const totals: Totals = computeTotals(
      payable.map((l) => ({ price: l.unitPrice, mrp: l.unitMrp, quantity: l.item.quantity })),
      { coupon: couponCheck?.ok ? coupon : null, store, paymentMethod },
    );
    return {
      lines,
      orphans,
      totals,
      coupon: couponCheck?.ok ? coupon : undefined,
      couponError: couponCheck && !couponCheck.ok ? couponCheck.reason : null,
      hasUnavailable: lines.some((l) => l.stock <= 0 || l.item.quantity > l.stock),
      count: lines.reduce((s, l) => s + l.item.quantity, 0),
    };
  }, [items, couponCode, products, coupons, store, paymentMethod]);
}

export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
}

export function useWishlistCount(): number {
  return useWishlistStore((s) => s.items.length);
}

export function useMyOrders() {
  const user = useCurrentUser();
  const orders = useOrderStore((s) => s.orders);
  return useMemo(() => (user ? orders.filter((o) => o.userId === user.id) : []), [orders, user]);
}

export function useMyNotifications() {
  const user = useCurrentUser();
  const all = useOrderStore((s) => s.notifications);
  return useMemo(() => (user ? all.filter((n) => n.recipientId === user.id) : []), [all, user]);
}
