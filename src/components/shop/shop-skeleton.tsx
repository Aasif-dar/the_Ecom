import { ProductGridSkeleton } from "@/components/product/product-grid";
import { Skeleton } from "@/components/ui/skeleton";

export function ShopSkeleton() {
  return (
    <div aria-busy aria-label="Loading products">
      <section className="container-x pb-8 pt-8 sm:pb-12 sm:pt-12">
        <Skeleton className="mb-6 h-3 w-40" />
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="h-14 w-72 max-w-full sm:h-20 sm:w-[28rem]" />
        <Skeleton className="mt-5 h-4 w-80 max-w-full" />
      </section>
      <div className="h-14 border-y border-line" />
      <div className="container-x grid gap-14 pt-8 lg:grid-cols-[17rem_1fr]">
        <div className="hidden space-y-8 lg:block">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-3 border-b border-line pb-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          ))}
        </div>
        <ProductGridSkeleton count={9} columns="3" />
      </div>
    </div>
  );
}
