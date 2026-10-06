"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BadgeCheck, PenLine, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { RatingInput, RatingStars } from "@/components/ui/rating-stars";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useReviewStore } from "@/store/reviews";
import { useOrderStore } from "@/store/orders";
import { useCurrentUser } from "@/store/hooks";

const schema = z.object({
  rating: z.number({ required_error: "Please choose a rating", invalid_type_error: "Please choose a rating" }).min(1, "Please choose a rating").max(5),
  title: z.string().trim().min(3, "Add a short headline").max(80, "Keep the headline under 80 characters"),
  body: z.string().trim().min(15, "Tell us a little more (at least 15 characters)").max(1200),
});
type Values = z.infer<typeof schema>;

export function useReviewEligibility(product: Product) {
  const user = useCurrentUser();
  const orders = useOrderStore((s) => s.orders);
  const reviews = useReviewStore((s) => s.reviews);
  return useMemo(() => {
    if (!user) return { state: "signed-out" as const };
    const deliveredOrder = orders.find((o) => o.userId === user.id && o.status === "delivered" && o.items.some((i) => i.productId === product.id));
    const already = reviews.some((r) => r.productId === product.id && r.userId === user.id);
    if (already) return { state: "reviewed" as const };
    if (!deliveredOrder) return { state: "not-purchased" as const };
    return { state: "eligible" as const, orderId: deliveredOrder.id };
  }, [user, orders, reviews, product.id]);
}

export function WriteReviewDialog({ product, open, onOpenChange, orderId }: { product: Product; open: boolean; onOpenChange: (o: boolean) => void; orderId?: string }) {
  const user = useCurrentUser();
  const addReview = useReviewStore((s) => s.addReview);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { rating: 0, title: "", body: "" } });
  const rating = watch("rating");

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Write a review"
      description={product.name}
      className="sm:max-w-lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="review-form" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit review"}
          </Button>
        </>
      }
    >
      <form
        id="review-form"
        noValidate
        className="space-y-5"
        onSubmit={handleSubmit(async (v) => {
          if (!user) return;
          await new Promise((r) => setTimeout(r, 400));
          const parts = user.name.split(" ");
          addReview({ productId: product.id, userId: user.id, userName: `${parts[0]} ${parts[1]?.[0] ?? ""}.`.trim(), rating: v.rating, title: v.title, body: v.body, verified: !!orderId, orderId });
          toast.success("Thank you for your review", { description: "It's now live on the product page." });
          reset();
          onOpenChange(false);
        })}
      >
        <Field label="Your rating" error={errors.rating} required>
          {() => <RatingInput value={rating} onChange={(v) => setValue("rating", v, { shouldValidate: true })} />}
        </Field>
        <Field label="Headline" error={errors.title} required>
          {(p) => <Input placeholder="Sum it up in a few words" {...p} {...register("title")} />}
        </Field>
        <Field label="Your review" error={errors.body} required>
          {(p) => <Textarea placeholder="How was the fit, fabric and finish?" rows={5} {...p} {...register("body")} />}
        </Field>
      </form>
    </Modal>
  );
}

export function ReviewSection({ product }: { product: Product }) {
  const allReviews = useReviewStore((s) => s.reviews);
  const markHelpful = useReviewStore((s) => s.markHelpful);
  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<"recent" | "high" | "low" | "helpful">("recent");
  const [visible, setVisible] = useState(4);
  const [writing, setWriting] = useState(false);
  const [helped, setHelped] = useState<Set<string>>(new Set());
  const elig = useReviewEligibility(product);

  const reviews = useMemo(() => allReviews.filter((r) => r.productId === product.id), [allReviews, product.id]);
  const breakdown = useMemo(() => {
    const b = [0, 0, 0, 0, 0];
    for (const r of reviews) b[r.rating - 1] += 1;
    return b;
  }, [reviews]);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const list = useMemo(() => {
    const filtered = filter ? reviews.filter((r) => r.rating === filter) : reviews;
    return [...filtered].sort((a, b) => {
      if (sort === "high") return b.rating - a.rating;
      if (sort === "low") return a.rating - b.rating;
      if (sort === "helpful") return b.helpful - a.helpful;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [reviews, filter, sort]);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 id="reviews-title" className="display-md">
          Reviews <span className="text-stone">({reviews.length})</span>
        </h2>
        {elig.state === "eligible" ? (
          <Button onClick={() => setWriting(true)}>
            <PenLine className="size-4" /> Write a review
          </Button>
        ) : elig.state === "signed-out" ? (
          <Link href={`/login?next=/product/${product.slug}`} className={buttonVariants({ variant: "outline" })}>
            Sign in to review
          </Link>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        <p className="border-y border-line py-10 text-center text-[0.9375rem] text-stone">No reviews yet. Be the first to share how it wears.</p>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[19rem_1fr] lg:gap-20">
          <div>
            <div className="flex items-end gap-4">
              <span className="font-serif text-[4.5rem] leading-[0.85]">{avg.toFixed(1)}</span>
              <div className="pb-1">
                <RatingStars value={avg} size={16} />
                <p className="mt-1.5 text-[0.8125rem] text-stone">Based on {reviews.length} reviews</p>
              </div>
            </div>
            <ul className="mt-7 space-y-2.5" aria-label="Rating breakdown">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = breakdown[n - 1];
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <li key={n}>
                    <button type="button" onClick={() => setFilter(filter === n ? null : n)} aria-pressed={filter === n} className={cn("group flex w-full items-center gap-3 text-[0.8125rem] tabular-nums", filter && filter !== n && "opacity-50")}>
                      <span className="w-8 text-left">{n} ★</span>
                      <span className="h-[3px] flex-1 bg-sand">
                        <span className="block h-full bg-ink transition-[width] duration-700" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-6 text-right text-stone">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {filter && (
              <button type="button" onClick={() => setFilter(null)} className="mt-4 text-[0.8125rem] underline underline-offset-4">
                Show all reviews
              </button>
            )}
            {elig.state === "not-purchased" && <p className="mt-8 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-stone">Only customers who have received this item can review it, so every review comes from real wear.</p>}
            {elig.state === "reviewed" && <p className="mt-8 border-t border-line pt-5 text-[0.8125rem] text-stone">You've already reviewed this product. Thank you.</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between border-b border-ink pb-3">
              <p className="text-[0.8125rem] text-stone">
                Showing {Math.min(visible, list.length)} of {list.length}
              </p>
              <label className="flex items-center gap-2 text-[0.8125rem]">
                <span className="text-stone">Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-transparent py-1 pr-1 font-medium outline-offset-2">
                  <option value="recent">Most recent</option>
                  <option value="helpful">Most helpful</option>
                  <option value="high">Highest rated</option>
                  <option value="low">Lowest rated</option>
                </select>
              </label>
            </div>
            <ul className="divide-y divide-line">
              {list.slice(0, visible).map((r) => (
                <li key={r.id} className="py-7">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <RatingStars value={r.rating} size={14} />
                    <span className="text-[0.75rem] uppercase tracking-[0.12em] text-stone">{formatDate(r.createdAt)}</span>
                  </div>
                  <h3 className="mt-3 font-sans text-[1.0625rem] font-medium leading-snug">{r.title}</h3>
                  <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-graphite">{r.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem]">
                    <span className="font-medium">{r.userName}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1.5 text-success">
                        <BadgeCheck className="size-4" /> Verified purchase
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={helped.has(r.id)}
                      onClick={() => {
                        markHelpful(r.id);
                        setHelped((s) => new Set(s).add(r.id));
                      }}
                      className="ml-auto inline-flex items-center gap-1.5 text-stone transition-colors hover:text-ink disabled:text-ink"
                    >
                      <ThumbsUp className="size-3.5" /> Helpful ({r.helpful})
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {visible < list.length && (
              <Button variant="outline" className="mt-4" onClick={() => setVisible((v) => v + 6)}>
                Load more reviews
              </Button>
            )}
          </div>
        </div>
      )}

      <WriteReviewDialog product={product} open={writing} onOpenChange={setWriting} orderId={elig.state === "eligible" ? elig.orderId : undefined} />
    </section>
  );
}
