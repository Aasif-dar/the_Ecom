"use client";

import type { Review } from "@/types";
import { SEED } from "@/data/seed";
import { createPersisted } from "./persist";
import { useCatalogStore } from "./catalog";

interface ReviewState {
  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "createdAt" | "helpful">) => Review;
  deleteReview: (id: string) => void;
  markHelpful: (id: string) => void;
}

function summarise(reviews: Review[], productId: string) {
  const mine = reviews.filter((r) => r.productId === productId);
  const count = mine.length;
  const rating = count ? Math.round((mine.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  return { rating, count };
}

export const useReviewStore = createPersisted<ReviewState>("reviews", (set, get) => ({
  reviews: SEED.reviews,

  addReview: (input) => {
    const review: Review = {
      ...input,
      id: `rev_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };
    set((s) => ({ reviews: [review, ...s.reviews] }));
    const { rating, count } = summarise(get().reviews, input.productId);
    useCatalogStore.getState().setRating(input.productId, rating, count);
    return review;
  },

  deleteReview: (id) => {
    const target = get().reviews.find((r) => r.id === id);
    set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) }));
    if (target) {
      const { rating, count } = summarise(get().reviews, target.productId);
      useCatalogStore.getState().setRating(target.productId, rating, count);
    }
  },

  markHelpful: (id) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)) })),
}));
