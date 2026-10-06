import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="container-x pb-10 pt-8" aria-busy aria-label="Loading product">
      <Skeleton className="mb-8 h-3 w-64" />
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="grid gap-4 md:grid-cols-[88px_1fr]">
          <div className="hidden flex-col gap-3 md:flex">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full" />
            ))}
          </div>
          <Skeleton className="aspect-[4/5] w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-4/5" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
