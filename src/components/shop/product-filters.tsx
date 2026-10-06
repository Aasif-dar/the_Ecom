"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import type { Category } from "@/types";
import type { ShopQuery } from "@/lib/filter";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";

function FilterSection({ title, children, defaultOpen = true, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-line py-5">
      <h3 className="font-sans">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left text-[0.72rem] font-medium uppercase tracking-[0.16em]">
          <span className="flex items-center gap-2">
            {title}
            {!!badge && <span className="grid size-4 place-items-center rounded-full bg-ink text-[0.6rem] text-paper">{badge}</span>}
          </span>
          <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
        </button>
      </h3>
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

export interface FilterProps {
  query: ShopQuery;
  update: (patch: Partial<ShopQuery>) => void;
  categories: Category[];
  categoryCounts: Map<string, number>;
  subCounts: Map<string, number>;
  facets: { sizes: { size: string; count: number }[]; colors: { name: string; hex: string; count: number }[]; priceMin: number; priceMax: number };
  /** category fixed by the route (e.g. /shop/women) */
  fixedCategory?: boolean;
}

export function ProductFilters({ query, update, categories, categoryCounts, subCounts, facets, fixedCategory }: FilterProps) {
  const activeCat = categories.find((c) => c.slug === query.category);
  const lo = query.min ?? facets.priceMin;
  const hi = query.max ?? facets.priceMax;
  const [range, setRange] = useState<[number, number]>([lo, hi]);
  useEffect(() => setRange([lo, hi]), [lo, hi]);

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div>
      {(!fixedCategory || activeCat) && (
        <FilterSection title={fixedCategory ? "Type" : "Category"} badge={query.sub ? 1 : 0}>
          <ul className="space-y-1 text-[0.9rem]">
            {!fixedCategory &&
              categories
                .filter((c) => c.status === "active")
                .map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => update({ category: query.category === c.slug ? undefined : c.slug, sub: undefined })}
                      aria-pressed={query.category === c.slug}
                      className={cn("flex w-full items-center justify-between py-1.5 text-left transition-colors hover:text-clay", query.category === c.slug && "font-medium text-ink")}
                    >
                      <span>{c.name}</span>
                      <span className="text-[0.78rem] tabular-nums text-stone">{categoryCounts.get(c.id) ?? 0}</span>
                    </button>
                    {query.category === c.slug && (
                      <ul className="mb-2 ml-3 mt-1 space-y-0.5 border-l border-line pl-3">
                        {c.subcategories
                          .filter((s) => s.status === "active")
                          .map((s) => (
                            <li key={s.id}>
                              <button type="button" onClick={() => update({ sub: query.sub === s.slug ? undefined : s.slug })} aria-pressed={query.sub === s.slug} className={cn("flex w-full items-center justify-between py-1 text-left text-[0.85rem] transition-colors hover:text-clay", query.sub === s.slug ? "font-medium text-ink" : "text-graphite")}>
                                <span>{s.name}</span>
                                <span className="text-[0.75rem] tabular-nums text-stone">{subCounts.get(s.id) ?? 0}</span>
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
            {fixedCategory && activeCat && (
              <>
                <li>
                  <button type="button" onClick={() => update({ sub: undefined })} aria-pressed={!query.sub} className={cn("flex w-full items-center justify-between py-1.5 text-left transition-colors hover:text-clay", !query.sub && "font-medium text-ink")}>
                    <span>All {activeCat.name}</span>
                    <span className="text-[0.78rem] tabular-nums text-stone">{categoryCounts.get(activeCat.id) ?? 0}</span>
                  </button>
                </li>
                {activeCat.subcategories
                  .filter((s) => s.status === "active")
                  .map((s) => (
                    <li key={s.id}>
                      <button type="button" onClick={() => update({ sub: query.sub === s.slug ? undefined : s.slug })} aria-pressed={query.sub === s.slug} className={cn("flex w-full items-center justify-between py-1.5 text-left transition-colors hover:text-clay", query.sub === s.slug && "font-medium text-ink")}>
                        <span>{s.name}</span>
                        <span className="text-[0.78rem] tabular-nums text-stone">{subCounts.get(s.id) ?? 0}</span>
                      </button>
                    </li>
                  ))}
              </>
            )}
          </ul>
        </FilterSection>
      )}

      <FilterSection title="Price" badge={query.min !== undefined || query.max !== undefined ? 1 : 0}>
        <div className="px-1">
          <Slider
            min={facets.priceMin}
            max={Math.max(facets.priceMax, facets.priceMin + 500)}
            step={100}
            value={range}
            onValueChange={(v) => Array.isArray(v) && setRange([v[0], v[1]])}
            onValueCommitted={(v) => {
              if (!Array.isArray(v)) return;
              update({ min: v[0] <= facets.priceMin ? undefined : v[0], max: v[1] >= facets.priceMax ? undefined : v[1] });
            }}
            aria-label="Price range"
          />
        </div>
        <div className="mt-4 flex items-center justify-between text-[0.8125rem] tabular-nums text-graphite">
          <span className="border border-line bg-paper-2 px-3 py-1.5">{formatINR(range[0])}</span>
          <span className="text-stone">to</span>
          <span className="border border-line bg-paper-2 px-3 py-1.5">{formatINR(range[1])}</span>
        </div>
      </FilterSection>

      {facets.sizes.length > 0 && (
        <FilterSection title="Size" badge={query.sizes.length}>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map(({ size }) => {
              const on = query.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ sizes: toggle(query.sizes, size) })}
                  className={cn("h-9 min-w-10 border px-2.5 text-[0.78rem] font-medium tabular-nums transition-colors", on ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 hover:border-ink")}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {facets.colors.length > 0 && (
        <FilterSection title="Colour" badge={query.colors.length}>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {facets.colors.slice(0, 16).map((c) => {
              const on = query.colors.includes(c.name);
              return (
                <li key={c.name}>
                  <button type="button" aria-pressed={on} onClick={() => update({ colors: toggle(query.colors, c.name) })} className={cn("flex w-full items-center gap-2.5 py-1.5 text-left text-[0.85rem] transition-colors hover:text-clay", on && "font-medium text-ink")}>
                    <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", on ? "border-ink" : "border-transparent")}>
                      <span className="size-3.5 rounded-full border border-ink/15" style={{ background: c.hex }} />
                    </span>
                    <span className="truncate">{c.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </FilterSection>
      )}

      <FilterSection title="Rating" badge={query.rating ? 1 : 0}>
        <ul className="space-y-1">
          {[4, 3].map((r) => (
            <li key={r}>
              <button type="button" aria-pressed={query.rating === r} onClick={() => update({ rating: query.rating === r ? undefined : r })} className={cn("flex w-full items-center gap-2 py-1.5 text-left text-[0.875rem] transition-colors hover:text-clay", query.rating === r && "font-medium text-ink")}>
                <span className="inline-flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={cn("size-3.5", i < r ? "fill-ink stroke-ink" : "stroke-stone/60")} strokeWidth={1.4} />
                  ))}
                </span>
                <span>& up</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Availability" badge={query.inStock ? 1 : 0}>
        <label className="flex cursor-pointer items-center gap-3 text-[0.9rem]">
          <Checkbox checked={query.inStock} onCheckedChange={(c) => update({ inStock: !!c })} aria-label="In stock only" />
          In stock only
        </label>
      </FilterSection>
    </div>
  );
}
