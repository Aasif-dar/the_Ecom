"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { parseQuery, toParams, type ShopQuery } from "@/lib/filter";

/** Filter state lives in the URL so listings are shareable, refresh-safe and back-button friendly. */
export function useShopQuery(base: Partial<ShopQuery> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const baseKey = JSON.stringify(base);
  const query = useMemo(() => {
    const parsed = parseQuery(new URLSearchParams(searchParams.toString()), base);
    return parsed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, baseKey]);

  const update = useCallback(
    (patch: Partial<ShopQuery>, opts: { keepPage?: boolean } = {}) => {
      const next: ShopQuery = { ...query, ...patch, page: opts.keepPage ? (patch.page ?? query.page) : (patch.page ?? 1) };
      const params = toParams(next);
      // keep `cat` (search/all-products mode) in the URL if set
      if (next.category && !base.category) params.set("cat", next.category);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [query, base.category, pathname, router],
  );

  const clear = useCallback(() => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }, [pathname, query.q, router]);

  return { query, update, clear, pending };
}
