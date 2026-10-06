"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Clock, Search, SearchX, TrendingUp, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { PriceDisplay } from "@/components/ui/price-display";
import { POPULAR_SEARCHES, suggest } from "@/lib/search";
import { useCatalogStore } from "@/store/catalog";
import { useSearchStore } from "@/store/search";
import { useUiStore } from "@/store/ui";
import { useActiveProducts } from "@/store/hooks";

export function SearchOverlay() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const products = useActiveProducts();
  const categories = useCatalogStore((s) => s.categories);
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.add);
  const removeRecent = useSearchStore((s) => s.remove);
  const clearRecent = useSearchStore((s) => s.clear);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    setQuery("");
  }, [open]);

  const result = useMemo(() => suggest(products, categories, deferred), [products, categories, deferred]);
  const typing = deferred.trim().length > 0;
  const noResults = typing && result.products.length === 0;

  const go = (q: string) => {
    const term = q.trim();
    if (!term) return;
    addRecent(term);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="top" showCloseButton={false} className="max-h-[92dvh] overflow-y-auto">
        <SheetTitle className="sr-only">Search</SheetTitle>
        <SheetDescription className="sr-only">Search products, categories and collections</SheetDescription>
        <div className="container-x py-6 sm:py-9">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              go(query);
            }}
            className="flex items-center gap-4 border-b-2 border-ink pb-3"
          >
            <Search className="size-6 shrink-0" strokeWidth={1.25} aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kurtas, denim, boots…"
              aria-label="Search the store"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent font-serif text-[1.65rem] leading-tight text-ink outline-none placeholder:text-stone/60 sm:text-[2.4rem]"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Clear search" className="grid size-9 place-items-center text-stone hover:text-ink">
                <X className="size-5" />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-ink hover:text-clay">
              Close
            </button>
          </form>

          <div className="mt-8 grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
            <div className="space-y-9">
              {!typing && recent.length > 0 && (
                <section aria-labelledby="recent-h">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 id="recent-h" className="eyebrow flex items-center gap-2 font-sans text-stone">
                      <Clock className="size-3.5" /> Recent
                    </h2>
                    <button type="button" onClick={clearRecent} className="text-[0.75rem] text-stone underline underline-offset-4 hover:text-ink">
                      Clear
                    </button>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <li key={r} className="group/chip flex items-center border border-line bg-paper-2 pl-3.5 pr-1.5 text-[0.875rem] transition-colors hover:border-ink">
                        <button type="button" onClick={() => go(r)} className="py-2 pr-2">
                          {r}
                        </button>
                        <button type="button" onClick={() => removeRecent(r)} aria-label={`Remove ${r}`} className="grid size-6 place-items-center text-stone hover:text-ink">
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section aria-labelledby="popular-h">
                <h2 id="popular-h" className="eyebrow mb-4 flex items-center gap-2 font-sans text-stone">
                  <TrendingUp className="size-3.5" /> {typing && result.terms.length ? "Related searches" : "Popular searches"}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {(typing && result.terms.length ? result.terms : POPULAR_SEARCHES).map((t) => (
                    <li key={t}>
                      <button type="button" onClick={() => go(t)} className="border border-line bg-paper-2 px-3.5 py-2 text-[0.875rem] capitalize transition-colors hover:border-ink hover:bg-ink hover:text-paper">
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {typing && result.categories.length > 0 && (
                <section aria-labelledby="cats-h">
                  <h2 id="cats-h" className="eyebrow mb-3 font-sans text-stone">
                    Categories
                  </h2>
                  <ul>
                    {result.categories.map((c) => (
                      <li key={c.href + c.label}>
                        <Link href={c.href} onClick={() => setOpen(false)} className="group flex items-center justify-between border-b border-line py-3 text-[0.9375rem] hover:text-clay">
                          {c.label}
                          <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <div aria-live="polite">
              {!typing && (
                <div>
                  <h2 className="eyebrow mb-4 font-sans text-stone">Trending now</h2>
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {products
                      .filter((p) => p.isBestSeller)
                      .slice(0, 4)
                      .map((p) => (
                        <li key={p.id}>
                          <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="group block">
                            <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                              <Image src={p.images[0]} alt="" fill sizes="200px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <p className="mt-2 line-clamp-1 text-[0.8125rem]">{p.name}</p>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {typing && result.products.length > 0 && (
                <div>
                  <h2 className="eyebrow mb-4 font-sans text-stone">Products</h2>
                  <ul className="divide-y divide-line border-y border-line">
                    {result.products.map((p) => (
                      <li key={p.id}>
                        <Link href={`/product/${p.slug}`} onClick={() => { addRecent(query); setOpen(false); }} className="group flex items-center gap-4 py-3">
                          <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden bg-bone">
                            <Image src={p.images[0]} alt="" fill sizes="60px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[0.9375rem] group-hover:text-clay">{p.name}</p>
                            <p className="mt-0.5 text-[0.8125rem] text-stone">{categories.find((c) => c.id === p.categoryId)?.name}</p>
                          </div>
                          <PriceDisplay price={p.price} mrp={p.mrp} showPercent={false} size="sm" className="shrink-0 flex-col items-end gap-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => go(query)} className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:text-clay">
                    See all results for “{query.trim()}” <ArrowRight className="size-4" />
                  </button>
                </div>
              )}

              {noResults && (
                <div className="flex flex-col items-start gap-3 py-6">
                  <SearchX className="size-9 text-stone" strokeWidth={1} />
                  <p className="font-serif text-[1.75rem] leading-none">Nothing for “{query.trim()}”</p>
                  <p className="max-w-sm text-[0.9375rem] text-stone">Check the spelling, try a broader term like “kurta” or “jacket”, or browse a popular search on the left.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
