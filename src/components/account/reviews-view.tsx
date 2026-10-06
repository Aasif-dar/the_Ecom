"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { AccountHeading } from "@/components/account/account-shell";
import { WriteReviewDialog } from "@/components/product/review-section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatDate } from "@/lib/format";
import { useCatalogStore } from "@/store/catalog";
import { useOrderStore } from "@/store/orders";
import { useReviewStore } from "@/store/reviews";
import { useCurrentUser } from "@/store/hooks";

export function ReviewsView() {
  const user = useCurrentUser();
  const orders = useOrderStore((s) => s.orders);
  const reviews = useReviewStore((s) => s.reviews);
  const deleteReview = useReviewStore((s) => s.deleteReview);
  const products = useCatalogStore((s) => s.products);
  const [reviewing, setReviewing] = useState<{ product: Product; orderId: string } | null>(null);

  const mine = useMemo(() => reviews.filter((r) => r.userId === user?.id), [reviews, user]);
  const pending = useMemo(() => {
    if (!user) return [];
    const seen = new Set<string>();
    const out: { product: Product; orderId: string }[] = [];
    for (const o of orders) {
      if (o.userId !== user.id || o.status !== "delivered") continue;
      for (const it of o.items) {
        if (seen.has(it.productId) || mine.some((r) => r.productId === it.productId)) continue;
        const product = products.find((p) => p.id === it.productId);
        if (product) {
          seen.add(it.productId);
          out.push({ product, orderId: o.id });
        }
      }
    }
    return out;
  }, [orders, user, mine, products]);

  if (!user) return null;

  return (
    <>
      <AccountHeading eyebrow="Account" title="Your" accent="reviews" />

      <section aria-labelledby="rv-pending" className="mb-14">
        <h2 id="rv-pending" className="mb-5 font-serif text-[1.8rem] leading-none">
          Waiting for your review <span className="font-sans text-base text-stone">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="border border-dashed border-line px-6 py-8 text-center text-[0.9rem] text-stone">You're all caught up. Delivered items you haven't reviewed will appear here.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {pending.map(({ product, orderId }) => (
              <li key={product.id} className="flex gap-4 border border-line bg-paper-2 p-4">
                <div className="relative h-[96px] w-[77px] shrink-0 overflow-hidden bg-bone">
                  <Image src={product.images[0]} alt={product.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="line-clamp-2 text-[0.9rem] leading-snug">{product.name}</p>
                  <p className="mt-1 font-mono text-[0.7rem] text-stone">{orderId}</p>
                  <Button size="xs" variant="outline" className="mt-auto w-fit" onClick={() => setReviewing({ product, orderId })}>
                    <Star className="size-3" /> Write review
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="rv-mine">
        <h2 id="rv-mine" className="mb-5 font-serif text-[1.8rem] leading-none">
          Published reviews <span className="font-sans text-base text-stone">({mine.length})</span>
        </h2>
        {mine.length === 0 ? (
          <EmptyState compact icon={Star} title="No reviews yet" body="Share how your pieces fit and wear. It helps others choose well." />
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {mine.map((r) => {
              const p = products.find((x) => x.id === r.productId);
              return (
                <li key={r.id} className="flex gap-5 py-6">
                  {p && (
                    <Link href={`/product/${p.slug}`} className="relative hidden h-[96px] w-[77px] shrink-0 overflow-hidden bg-bone sm:block">
                      <Image src={p.images[0]} alt={p.name} fill sizes="80px" className="object-cover" />
                    </Link>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <RatingStars value={r.rating} size={14} />
                      <span className="text-[0.75rem] uppercase tracking-[0.12em] text-stone">{formatDate(r.createdAt)}</span>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-success">
                          <BadgeCheck className="size-4" /> Verified purchase
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[0.8125rem] text-stone">{p?.name}</p>
                    <h3 className="mt-1 font-sans text-[1rem] font-medium">{r.title}</h3>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-graphite">{r.body}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete review"
                    onClick={() => {
                      deleteReview(r.id);
                      toast("Review deleted");
                    }}
                    className="self-start p-2 text-stone transition-colors hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {reviewing && <WriteReviewDialog product={reviewing.product} orderId={reviewing.orderId} open onOpenChange={(o) => !o && setReviewing(null)} />}
    </>
  );
}
