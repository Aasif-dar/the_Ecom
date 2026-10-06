import type { Category, Product } from "@/types";

const SYNONYMS: Record<string, string> = {
  kurti: "kurta", kurtis: "kurta", kurtas: "kurta",
  tshirt: "tee", tshirts: "tee", "t-shirt": "tee", "t-shirts": "tee", tees: "tee", shirt: "shirt",
  sneaker: "sneakers", trainers: "sneakers", shoes: "footwear", shoe: "footwear",
  sari: "saree", sarees: "saree", saris: "saree",
  sunglass: "sunglasses", shades: "sunglasses", glasses: "eyewear",
  handbag: "bag", handbags: "bag", bags: "bag", purse: "bag", backpack: "bag",
  jean: "jeans", denims: "denim", pants: "trousers", pant: "trousers", trouser: "trousers",
  jackets: "jacket", coats: "coat", blazers: "blazer", dresses: "dress", frock: "dress",
  earring: "earrings", necklaces: "necklace", bracelets: "bracelet", rings: "jewellery", jewelry: "jewellery",
  watch: "accessories", hoodies: "hoodie", sweater: "knitwear", sweatshirts: "sweatshirt", heels: "heels",
  boots: "boots", belts: "belt", wallets: "wallet", scarves: "scarf", ties: "tie", hats: "hat",
};

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => SYNONYMS[t] ?? t);
}

function stem(t: string) {
  return t.length > 4 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t;
}

function wordMatch(hay: string, token: string): 0 | 1 | 2 {
  // 2 = starts a word, 1 = contained
  const t = stem(token);
  if (hay.startsWith(t) || hay.includes(" " + t) || hay.includes("-" + t)) return 2;
  return hay.includes(t) ? 1 : 0;
}

export interface SearchHit {
  product: Product;
  score: number;
}

export function searchProducts(products: Product[], categories: Category[], query: string): SearchHit[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const catName = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));
  const subName = new Map(categories.flatMap((c) => c.subcategories.map((s) => [s.id, s.name.toLowerCase()] as const)));

  const scoreOf = (p: Product, token: string) => {
    let s = 0;
    s += wordMatch(p.name.toLowerCase(), token) * 5;
    s += wordMatch(subName.get(p.subcategoryId) ?? "", token) * 3;
    s += wordMatch(catName.get(p.categoryId) ?? "", token) * 2;
    for (const tag of p.tags) s += wordMatch(tag.toLowerCase(), token) * 2;
    for (const c of p.collections) s += wordMatch(c, token);
    for (const c of p.colors) s += wordMatch(c.name.toLowerCase(), token) * 2;
    s += wordMatch(p.fabric.toLowerCase(), token);
    s += wordMatch(p.shortDescription.toLowerCase(), token) * 0.5;
    return s;
  };

  const all: SearchHit[] = [];
  for (const p of products) {
    const per = tokens.map((t) => scoreOf(p, t));
    if (per.every((s) => s > 0)) all.push({ product: p, score: per.reduce((a, b) => a + b, 0) + p.rating * 0.1 + (p.isBestSeller ? 1 : 0) });
  }
  if (all.length) return all.sort((a, b) => b.score - a.score);

  // relaxed: any token
  const any: SearchHit[] = [];
  for (const p of products) {
    const total = tokens.reduce((s, t) => s + scoreOf(p, t), 0);
    if (total > 2) any.push({ product: p, score: total * 0.4 });
  }
  return any.sort((a, b) => b.score - a.score);
}

export interface Suggestions {
  products: Product[];
  categories: { label: string; href: string }[];
  terms: string[];
}

export function suggest(products: Product[], categories: Category[], query: string): Suggestions {
  const q = query.trim();
  if (q.length < 1) return { products: [], categories: [], terms: [] };
  const hits = searchProducts(products, categories, q);
  const tokens = tokenize(q);
  const cats: Suggestions["categories"] = [];
  for (const c of categories) {
    if (c.status !== "active") continue;
    if (tokens.every((t) => c.name.toLowerCase().includes(stem(t)))) cats.push({ label: c.name, href: `/shop/${c.slug}` });
    for (const s of c.subcategories) {
      if (s.status !== "active") continue;
      const label = `${s.name} · ${c.name}`;
      if (tokens.every((t) => s.name.toLowerCase().includes(stem(t)))) cats.push({ label, href: `/shop/${c.slug}?sub=${s.slug}` });
    }
  }
  // tag-based search terms drawn from matching products
  const counts = new Map<string, number>();
  for (const { product } of hits.slice(0, 20)) {
    for (const t of product.tags) {
      if (tokens.some((tok) => t.toLowerCase().includes(stem(tok))) && t.toLowerCase() !== q.toLowerCase()) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
  }
  const terms = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
  return { products: hits.slice(0, 5).map((h) => h.product), categories: cats.slice(0, 4), terms };
}

export const POPULAR_SEARCHES = ["Kurta", "Denim jacket", "Linen dress", "Leather boots", "Saree", "Blazer", "Sunglasses", "White shirt"];
