"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PackageSearch, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/shop/product-filters";
import { useShopQuery } from "@/hooks/use-shop-query";
import { PAGE_SIZE, SORT_OPTIONS, activeFilterCount, applyFilters, facets as computeFacets, sortProducts, type ShopQuery, type SortKey } from "@/lib/filter";
import { POPULAR_SEARCHES } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";
import { useSearchStore } from "@/store/search";
import { useEffect } from "react";

export interface ShopViewProps {
  base?: Partial<ShopQuery>;
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb: Crumb[];
  banner?: string;
  mode?: "shop" | "search";
  /** route fixes the category (e.g. /shop/women) so the sidebar lists its subcategories */
  fixedCategory?: boolean;
}

export function ShopView({ base = {}, eyebrow, title, description, breadcrumb, banner, mode = "shop", fixedCategory }: ShopViewProps) {
  const { query, update, clear, pending } = useShopQuery(base);
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const addRecent = useSearchStore((s) => s.add);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const heading = mode === "search" ? (query.q ? `Results for “${query.q}”` : "Search") : title;
  const subheading = mode === "search" ? (query.q ? undefined : "Type a product, category or style above.") : description;

  const category = query.category ? categories.find((c) => c.slug === query.category) : undefined;
  const missingCategory = !!query.category && !category;

  useEffect(() => {
    if (mode === "search" && query.q) addRecent(query.q);
  }, [mode, query.q, addRecent]);

  const { items, rank } = useMemo(() => applyFilters(products, categories, query), [products, categories, query]);
  const sorted = useMemo(() => sortProducts(items, query.sort, rank), [items, query.sort, rank]);
  const facetData = useMemo(() => computeFacets(products, categories, query), [products, categories, query]);

  const categoryCounts = useMemo(() => {
    const { items: it } = applyFilters(products, categories, { ...query, category: undefined, sub: undefined });
    const m = new Map<string, number>();
    for (const p of it) m.set(p.categoryId, (m.get(p.categoryId) ?? 0) + 1);
    if (fixedCategory && category) m.set(category.id, applyFilters(products, categories, { ...query, sub: undefined }).items.length);
    return m;
  }, [products, categories, query, fixedCategory, category]);

  const subCounts = useMemo(() => {
    const m = new Map<string, number>();
    if (!category) return m;
    const { items: it } = applyFilters(products, categories, { ...query, sub: undefined });
    for (const p of it) m.set(p.subcategoryId, (m.get(p.subcategoryId) ?? 0) + 1);
    return m;
  }, [products, categories, query, category]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filterCount = activeFilterCount(query) + (mode === "shop" && !fixedCategory && query.category ? 1 : 0);

  // removable chips
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (!fixedCategory && category) chips.push({ key: "cat", label: category.name, remove: () => update({ category: undefined, sub: undefined }) });
  if (query.sub && category) {
    const sub = category.subcategories.find((s) => s.slug === query.sub);
    if (sub) chips.push({ key: "sub", label: sub.name, remove: () => update({ sub: undefined }) });
  }
  if (query.min !== undefined || query.max !== undefined)
    chips.push({ key: "price", label: `₹${(query.min ?? facetData.priceMin).toLocaleString("en-IN")} – ₹${(query.max ?? facetData.priceMax).toLocaleString("en-IN")}`, remove: () => update({ min: undefined, max: undefined }) });
  for (const s of query.sizes) chips.push({ key: `s-${s}`, label: `Size ${s}`, remove: () => update({ sizes: query.sizes.filter((x) => x !== s) }) });
  for (const c of query.colors) chips.push({ key: `c-${c}`, label: c, remove: () => update({ colors: query.colors.filter((x) => x !== c) }) });
  if (query.inStock) chips.push({ key: "stock", label: "In stock", remove: () => update({ inStock: false }) });
  if (query.rating) chips.push({ key: "rating", label: `${query.rating}★ & up`, remove: () => update({ rating: undefined }) });

  const filtersEl = (
    <ProductFilters query={query} update={update} categories={categories} categoryCounts={categoryCounts} subCounts={subCounts} facets={facetData} fixedCategory={fixedCategory} />
  );

  if (missingCategory) {
    return (
      <div className="container-x py-10">
        <EmptyState
          icon={PackageSearch}
          title="We couldn't find that category"
          body="It may have been renamed or removed. Browse the full range instead."
          actions={
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              Shop everything
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* page header */}
      {banner ? (
        <section className="relative isolate">
          <div className="relative h-[17rem] overflow-hidden bg-ink sm:h-[22rem]">
            <Image src={banner} alt="" fill priority sizes="100vw" className="object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/10" />
            <div className="container-x relative flex h-full flex-col justify-end pb-8 text-paper sm:pb-10">
              <Breadcrumb items={breadcrumb} className="mb-5 [&_a]:text-paper/70 [&_a:hover]:text-paper [&_li]:text-paper/70 [&_span[aria-current]]:text-paper" />
              {eyebrow && <p className="eyebrow mb-3 text-paper/80">{eyebrow}</p>}
              <h1 className="display-lg">{heading}</h1>
              {subheading && <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-paper/85">{subheading}</p>}
            </div>
          </div>
        </section>
      ) : (
        <section className="container-x pb-8 pt-8 sm:pb-12 sm:pt-12">
          <Breadcrumb items={breadcrumb} className="mb-6" />
          {eyebrow && <p className="eyebrow mb-3 text-clay">{eyebrow}</p>}
          <h1 className="display-lg">{heading}</h1>
          {subheading && <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-graphite">{subheading}</p>}
        </section>
      )}

      {/* toolbar */}
      <div className="sticky top-16 z-30 border-y border-line bg-paper lg:top-[4.5rem]">
        <div className="container-x flex h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] lg:hidden"
            >
              <SlidersHorizontal className="size-4" /> Filters
              {filterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-ink text-[0.625rem] text-paper">{filterCount}</span>}
            </button>
            <p className="text-[0.8125rem] text-stone" aria-live="polite">
              <span className="tabular-nums text-ink">{sorted.length}</span> {sorted.length === 1 ? "product" : "products"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[0.72rem] font-medium uppercase tracking-[0.16em] text-stone sm:inline">Sort by</span>
            <Select value={query.sort} onValueChange={(v) => update({ sort: v as SortKey }, { keepPage: false })} items={SORT_OPTIONS}>
              <SelectTrigger size="sm" aria-label="Sort products" className="w-[10.5rem] border-0 bg-transparent px-2 text-[0.8125rem] font-medium hover:bg-bone sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false} className="min-w-52">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-12 pb-4 pt-8 lg:grid-cols-[15.5rem_1fr] lg:gap-14 xl:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[10.5rem] max-h-[calc(100dvh-11.5rem)] overflow-y-auto pr-2 thin-scroll">
            <div className="flex items-center justify-between pb-2">
              <h2 className="font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em]">Filter</h2>
              {filterCount > 0 && (
                <button type="button" onClick={clear} className="text-[0.8125rem] text-stone underline underline-offset-4 hover:text-ink">
                  Clear all
                </button>
              )}
            </div>
            {filtersEl}
          </div>
        </aside>

        <div id="results" className="min-w-0 scroll-mt-40">
          {chips.length > 0 && (
            <ul className="mb-8 flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.key}>
                  <button type="button" onClick={c.remove} className="group inline-flex items-center gap-2 border border-ink bg-paper-2 py-1.5 pl-3 pr-2 text-[0.8125rem] transition-colors hover:bg-ink hover:text-paper">
                    {c.label} <X className="size-3.5" aria-label="Remove filter" />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clear} className="px-2 text-[0.8125rem] text-stone underline underline-offset-4 hover:text-ink">
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {sorted.length === 0 ? (
            mode === "search" && query.q && filterCount === 0 ? (
              <EmptyState
                icon={SearchX}
                title={`No results for “${query.q}”`}
                body="Check the spelling or try a more general term. Here are some searches other customers enjoy."
                actions={
                  <div className="flex max-w-lg flex-wrap justify-center gap-2">
                    {POPULAR_SEARCHES.map((t) => (
                      <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="border border-line bg-paper-2 px-3.5 py-2 text-[0.875rem] transition-colors hover:border-ink hover:bg-ink hover:text-paper">
                        {t}
                      </Link>
                    ))}
                  </div>
                }
              />
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="Nothing matches these filters"
                body="Try removing a filter or two to see more of the range."
                actions={
                  <Button size="lg" onClick={clear}>
                    Clear all filters
                  </Button>
                }
              />
            )
          ) : (
            <div className={cn("transition-opacity duration-300", pending && "opacity-60")}>
              <ProductGrid products={pageItems} columns="3" priorityCount={4} />
              <Pagination
                className="mt-16"
                page={page}
                totalPages={totalPages}
                onChange={(p) => {
                  update({ page: p }, { keepPage: true });
                  document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* mobile filters */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="!w-full sm:!max-w-sm">
          <SheetHeader className="border-b">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription className="sr-only">Refine the product list</SheetDescription>
          </SheetHeader>
          <div className="thin-scroll flex-1 overflow-y-auto px-6">{filtersEl}</div>
          <SheetFooter className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={clear}>
              Clear all
            </Button>
            <Button size="lg" onClick={() => setFiltersOpen(false)}>
              Show {sorted.length}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

