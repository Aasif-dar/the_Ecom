import type { Category, Product, Subcategory, Variant } from "@/types";

export const LOW_STOCK_THRESHOLD = 5;

export function totalStock(p: Product): number {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}

export function isInStock(p: Product): boolean {
  return totalStock(p) > 0;
}

export function findVariant(p: Product, color: string, size: string): Variant | undefined {
  return p.variants.find((v) => v.color === color && v.size === size);
}

export function variantStock(p: Product, color: string, size: string): number {
  return findVariant(p, color, size)?.stock ?? 0;
}

/** Sizes available for a given colour (stock > 0) */
export function sizeAvailability(p: Product, color: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of p.sizes) out[s] = variantStock(p, color, s);
  return out;
}

export function colorHasStock(p: Product, color: string): boolean {
  return p.variants.some((v) => v.color === color && v.stock > 0);
}

export type StockState = "in" | "low" | "out";
export function stockState(stock: number): StockState {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

export function productStockState(p: Product): StockState {
  return stockState(totalStock(p));
}

export function findCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function findSubcategory(categories: Category[], id: string): Subcategory | undefined {
  for (const c of categories) {
    const s = c.subcategories.find((x) => x.id === id);
    if (s) return s;
  }
  return undefined;
}

export function cartLineId(productId: string, color: string, size: string) {
  return `${productId}:${color}:${size}`;
}

/** Rebuild the variant matrix after colours/sizes change, preserving existing stock + SKUs. */
export function syncVariants(
  slugOrSku: string,
  colors: { name: string }[],
  sizes: string[],
  existing: Variant[],
  defaultStock = 10,
): Variant[] {
  const out: Variant[] = [];
  for (const c of colors) {
    for (const s of sizes) {
      const prev = existing.find((v) => v.color === c.name && v.size === s);
      out.push(
        prev ?? {
          id: `${slugOrSku}:${c.name}:${s}`,
          sku: `${slugOrSku}-${c.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase()}-${s.replace(/\s/g, "")}`,
          color: c.name,
          size: s,
          stock: defaultStock,
        },
      );
    }
  }
  return out;
}

export function isOnSale(p: Product) {
  return p.mrp > p.price;
}
