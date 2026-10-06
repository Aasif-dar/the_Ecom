import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
  columns = "4",
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
  columns?: "3" | "4";
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 md:gap-y-12",
        columns === "4" ? "xl:grid-cols-4" : "xl:grid-cols-3",
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="mt-4 h-2.5 w-16" />
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-3 h-4 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = "4", className }: { count?: number; columns?: "3" | "4"; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 md:gap-y-12",
        columns === "4" ? "xl:grid-cols-4" : "xl:grid-cols-3",
        className,
      )}
      aria-busy
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
