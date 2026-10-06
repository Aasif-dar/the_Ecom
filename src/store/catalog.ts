"use client";

import type { Category, Product, Subcategory } from "@/types";
import { SEED } from "@/data/seed";
import { createPersisted } from "./persist";
import { slugify } from "@/lib/format";

type StockLine = { productId: string; color: string; size: string; quantity: number };

interface CatalogState {
  products: Product[];
  categories: Category[];

  addProduct: (input: Omit<Product, "id" | "createdAt" | "rating" | "reviewCount" | "unitsSold"> & Partial<Pick<Product, "rating" | "reviewCount" | "unitsSold">>) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | undefined;
  setVariantStock: (productId: string, variantId: string, stock: number) => void;
  /** direction -1 reserves stock for an order, +1 restocks (cancellations) */
  adjustStock: (lines: StockLine[], direction: 1 | -1) => void;
  setRating: (productId: string, rating: number, reviewCount: number) => void;

  addCategory: (input: { name: string; description: string; image: string }) => Category;
  updateCategory: (id: string, patch: Partial<Omit<Category, "id" | "subcategories">>) => void;
  deleteCategory: (id: string) => boolean;
  addSubcategory: (categoryId: string, name: string) => void;
  updateSubcategory: (id: string, patch: Partial<Subcategory>) => void;
  deleteSubcategory: (id: string) => boolean;
}

const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function uniqueSlug(base: string, products: Product[], exceptId?: string) {
  let slug = slugify(base) || "product";
  let n = 2;
  while (products.some((p) => p.slug === slug && p.id !== exceptId)) slug = `${slugify(base)}-${n++}`;
  return slug;
}

export const useCatalogStore = createPersisted<CatalogState>("catalog", (set, get) => ({
  products: SEED.products,
  categories: SEED.categories,

  addProduct: (input) => {
    const state = get();
    const product: Product = {
      rating: 0,
      reviewCount: 0,
      unitsSold: 0,
      ...input,
      id: uid("prd"),
      slug: uniqueSlug(input.slug || input.name, state.products),
      createdAt: new Date().toISOString(),
    };
    set({ products: [product, ...state.products] });
    return product;
  },

  updateProduct: (id, patch) =>
    set((s) => ({
      products: s.products.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        if (patch.slug !== undefined) next.slug = uniqueSlug(patch.slug, s.products, id);
        return next;
      }),
    })),

  deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  duplicateProduct: (id) => {
    const state = get();
    const src = state.products.find((p) => p.id === id);
    if (!src) return undefined;
    const newId = uid("prd");
    const name = `${src.name} (Copy)`;
    const slug = uniqueSlug(name, state.products);
    const copy: Product = {
      ...src,
      id: newId,
      name,
      slug,
      sku: `${src.sku}-COPY`,
      status: "draft",
      isNew: false,
      isBestSeller: false,
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      unitsSold: 0,
      createdAt: new Date().toISOString(),
      variants: src.variants.map((v) => ({ ...v, id: v.id.replace(src.slug, slug), sku: `${v.sku}-COPY` })),
    };
    set({ products: [copy, ...state.products] });
    return copy;
  },

  setVariantStock: (productId, variantId, stock) =>
    set((s) => ({
      products: s.products.map((p) =>
        p.id === productId ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock: Math.max(0, Math.floor(stock)) } : v)) } : p,
      ),
    })),

  adjustStock: (lines, direction) =>
    set((s) => ({
      products: s.products.map((p) => {
        const mine = lines.filter((l) => l.productId === p.id);
        if (!mine.length) return p;
        return {
          ...p,
          unitsSold: Math.max(0, p.unitsSold - direction * mine.reduce((a, l) => a + l.quantity, 0)),
          variants: p.variants.map((v) => {
            const hit = mine.find((l) => l.color === v.color && l.size === v.size);
            return hit ? { ...v, stock: Math.max(0, v.stock + direction * hit.quantity) } : v;
          }),
        };
      }),
    })),

  setRating: (productId, rating, reviewCount) =>
    set((s) => ({ products: s.products.map((p) => (p.id === productId ? { ...p, rating, reviewCount } : p)) })),

  addCategory: ({ name, description, image }) => {
    const slug = slugify(name);
    const cat: Category = { id: `cat_${slug}`, slug, name, description, image, status: "active", subcategories: [] };
    set((s) => ({ categories: [...s.categories, cat] }));
    return cat;
  },

  updateCategory: (id, patch) =>
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch, slug: patch.name ? c.slug : c.slug } : c)) })),

  deleteCategory: (id) => {
    if (get().products.some((p) => p.categoryId === id)) return false;
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
    return true;
  },

  addSubcategory: (categoryId, name) =>
    set((s) => ({
      categories: s.categories.map((c) => {
        if (c.id !== categoryId) return c;
        const slug = slugify(name);
        const sub: Subcategory = { id: `sub_${c.slug}_${slug}`, slug, name, categoryId, status: "active" };
        return c.subcategories.some((x) => x.id === sub.id) ? c : { ...c, subcategories: [...c.subcategories, sub] };
      }),
    })),

  updateSubcategory: (id, patch) =>
    set((s) => ({
      categories: s.categories.map((c) => ({ ...c, subcategories: c.subcategories.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    })),

  deleteSubcategory: (id) => {
    if (get().products.some((p) => p.subcategoryId === id)) return false;
    set((s) => ({ categories: s.categories.map((c) => ({ ...c, subcategories: c.subcategories.filter((x) => x.id !== id) })) }));
    return true;
  },
}));
