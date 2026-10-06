"use client";

import { useMemo } from "react";
import { computeAnalytics } from "@/lib/analytics";
import { useAuthStore } from "@/store/auth";
import { useCatalogStore } from "@/store/catalog";
import { useOrderStore } from "@/store/orders";

/** Live back-office numbers, derived from the same stores the storefront writes to. */
export function useAnalytics() {
  const orders = useOrderStore((s) => s.orders);
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const users = useAuthStore((s) => s.users);
  return useMemo(() => computeAnalytics(orders, products, users, categories), [orders, products, users, categories]);
}
