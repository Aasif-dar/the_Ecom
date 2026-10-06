import type { Category, Product } from "@/types";
import { searchProducts } from "./search";
import { totalStock } from "./product-utils";

export type SortKey = "recommended" | "newest" | "price-asc" | "price-desc" | "rating";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
];

export type SpecialCollection = "new-arrivals" | "best-sellers" | "sale";
export const SPECIAL_ROUTES: Record<SpecialCollection, { title: string; blurb: string }> = {
  "new-arrivals": { title: "New Arrivals", blurb: "Just landed. The latest from the studio, in limited quantities." },
  "best-sellers": { title: "Best Sellers", blurb: "The pieces our customers keep coming back for." },
  sale: { title: "The Festive Sale", blurb: "Up to 40% off selected styles. Limited time, limited stock." },
};

export interface ShopQuery {
  category?: string; // category slug
  sub?: string; // subcategory slug
  special?: SpecialCollection;
  collection?: string; // collection slug
  q?: string;
  min?: number;
  max?: number;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  rating?: number;
  sort: SortKey;
  page: number;
}

export const PAGE_SIZE = 24;

export function emptyQuery(): ShopQuery {
  return { sizes: [], colors: [], inStock: false, sort: "recommended", page: 1 };
}

const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const num = (v: string | null) => (v !== null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined);

/** Reads the filter state encoded in the URL. */
export function parseQuery(params: URLSearchParams, base: Partial<ShopQuery> = {}): ShopQuery {
  const sort = params.get("sort") as SortKey | null;
  return {
    ...emptyQuery(),
    ...base,
    category: base.category ?? params.get("cat") ?? undefined,
    sub: params.get("sub") ?? base.sub,
    q: params.get("q") ?? base.q,
    min: num(params.get("min")),
    max: num(params.get("max")),
    sizes: list(params.get("size")),
    colors: list(params.get("color")),
    inStock: params.get("stock") === "in",
    rating: num(params.get("rating")),
    sort: sort && SORT_OPTIONS.some((o) => o.value === sort) ? sort : "recommended",
    page: Math.max(1, num(params.get("page")) ?? 1),
  };
}

/** Serialises the filter state back into URL params (omitting defaults). */
export function toParams(q: Partial<ShopQuery>): URLSearchParams {
  const p = new URLSearchParams();
  if (q.sub) p.set("sub", q.sub);
  if (q.q) p.set("q", q.q);
  if (q.min !== undefined) p.set("min", String(q.min));
  if (q.max !== undefined) p.set("max", String(q.max));
  if (q.sizes?.length) p.set("size", q.sizes.join(","));
  if (q.colors?.length) p.set("color", q.colors.join(","));
  if (q.inStock) p.set("stock", "in");
  if (q.rating) p.set("rating", String(q.rating));
  if (q.sort && q.sort !== "recommended") p.set("sort", q.sort);
  if (q.page && q.page > 1) p.set("page", String(q.page));
  return p;
}

export function activeFilterCount(q: ShopQuery): number {
  return (
    (q.sub ? 1 : 0) +
    (q.min !== undefined || q.max !== undefined ? 1 : 0) +
    q.sizes.length +
    q.colors.length +
    (q.inStock ? 1 : 0) +
    (q.rating ? 1 : 0)
  );
}

function recommendedScore(p: Product) {
  return (p.isFeatured ? 3000 : 0) + (p.isBestSeller ? 1500 : 0) + (p.isNew ? 800 : 0) + p.unitsSold * 0.4 + p.rating * 80;
}

export function sortProducts(products: Product[], sort: SortKey, searchRank?: Map<string, number>): Product[] {
  const arr = [...products];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    default:
      if (searchRank) return arr.sort((a, b) => (searchRank.get(b.id) ?? 0) - (searchRank.get(a.id) ?? 0));
      return arr.sort((a, b) => recommendedScore(b) - recommendedScore(a));
  }
}

/** Applies every filter except the dimension named in `skip` (used to compute facet counts). */
export function applyFilters(
  products: Product[],
  categories: Category[],
  q: ShopQuery,
  skip?: "size" | "color" | "price" | "sub" | "rating" | "stock",
): { items: Product[]; rank?: Map<string, number> } {
  let items = products.filter((p) => p.status === "active");
  let rank: Map<string, number> | undefined;

  if (q.q) {
    const hits = searchProducts(items, categories, q.q);
    rank = new Map(hits.map((h) => [h.product.id, h.score]));
    items = hits.map((h) => h.product);
  }
  if (q.category) {
    const cat = categories.find((c) => c.slug === q.category);
    items = cat ? items.filter((p) => p.categoryId === cat.id) : [];
    if (q.sub && skip !== "sub" && cat) {
      const sub = cat.subcategories.find((s) => s.slug === q.sub);
      items = sub ? items.filter((p) => p.subcategoryId === sub.id) : items;
    }
  }
  if (q.special === "new-arrivals") items = items.filter((p) => p.isNew);
  if (q.special === "best-sellers") items = items.filter((p) => p.isBestSeller);
  if (q.special === "sale") items = items.filter((p) => p.mrp > p.price && (p.mrp - p.price) / p.mrp >= 0.25);
  if (q.collection) items = items.filter((p) => p.collections.includes(q.collection!));

  if (skip !== "price") {
    if (q.min !== undefined) items = items.filter((p) => p.price >= q.min!);
    if (q.max !== undefined) items = items.filter((p) => p.price <= q.max!);
  }
  if (skip !== "size" && q.sizes.length) items = items.filter((p) => p.variants.some((v) => q.sizes.includes(v.size) && v.stock > 0));
  if (skip !== "color" && q.colors.length) items = items.filter((p) => p.colors.some((c) => q.colors.includes(c.name)));
  if (skip !== "stock" && q.inStock) items = items.filter((p) => totalStock(p) > 0);
  if (skip !== "rating" && q.rating) items = items.filter((p) => p.rating >= q.rating!);
  return { items, rank };
}

export function runQuery(products: Product[], categories: Category[], q: ShopQuery) {
  const { items, rank } = applyFilters(products, categories, q);
  return sortProducts(items, q.sort, rank);
}

/** Distinct facet values with counts, computed from the products matching every other filter. */
export function facets(products: Product[], categories: Category[], q: ShopQuery) {
  const sizeBase = applyFilters(products, categories, q, "size").items;
  const colorBase = applyFilters(products, categories, q, "color").items;
  const sizes = new Map<string, number>();
  for (const p of sizeBase) {
    const seen = new Set<string>();
    for (const v of p.variants) if (v.stock > 0 && !seen.has(v.size)) { seen.add(v.size); sizes.set(v.size, (sizes.get(v.size) ?? 0) + 1); }
  }
  const colors = new Map<string, { hex: string; count: number }>();
  for (const p of colorBase) for (const c of p.colors) {
    const cur = colors.get(c.name) ?? { hex: c.hex, count: 0 };
    cur.count += 1;
    colors.set(c.name, cur);
  }
  const priceBase = applyFilters(products, categories, q, "price").items;
  const prices = priceBase.map((p) => p.price);
  return {
    sizes: sortSizes([...sizes.entries()]),
    colors: [...colors.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count),
    priceMin: prices.length ? Math.floor(Math.min(...prices) / 100) * 100 : 0,
    priceMax: prices.length ? Math.ceil(Math.max(...prices) / 500) * 500 : 20000,
  };
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
function sortSizes(entries: [string, number][]) {
  return entries
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a.size);
      const ib = SIZE_ORDER.indexOf(b.size);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return Number(a.size) - Number(b.size);
    });
}
