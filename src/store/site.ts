"use client";

import type { Coupon, Offer, SiteContent, StoreSettings } from "@/types";
import { SEED } from "@/data/seed";
import { createPersisted } from "./persist";

interface SiteState {
  content: SiteContent;
  settings: StoreSettings;
  coupons: Coupon[];
  newsletter: { email: string; at: string }[];

  updateContent: (patch: Partial<SiteContent>) => void;
  updateHero: (patch: Partial<SiteContent["hero"]>) => void;
  updatePromo: (patch: Partial<SiteContent["promo"]>) => void;
  toggleSection: (id: SiteContent["sections"][number]["id"], enabled: boolean) => void;
  moveSection: (id: SiteContent["sections"][number]["id"], dir: -1 | 1) => void;
  upsertOffer: (offer: Offer) => void;
  deleteOffer: (id: string) => void;
  updateSettings: <K extends keyof StoreSettings>(section: K, patch: Partial<StoreSettings[K]>) => void;
  upsertCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  bumpCoupon: (code: string) => void;
  subscribe: (email: string) => void;
}

export const useSiteStore = createPersisted<SiteState>("site", (set) => ({
  content: SEED.content,
  settings: SEED.settings,
  coupons: SEED.coupons,
  newsletter: [],

  updateContent: (patch) => set((s) => ({ content: { ...s.content, ...patch } })),
  updateHero: (patch) => set((s) => ({ content: { ...s.content, hero: { ...s.content.hero, ...patch } } })),
  updatePromo: (patch) => set((s) => ({ content: { ...s.content, promo: { ...s.content.promo, ...patch } } })),
  toggleSection: (id, enabled) =>
    set((s) => ({ content: { ...s.content, sections: s.content.sections.map((x) => (x.id === id ? { ...x, enabled } : x)) } })),
  moveSection: (id, dir) =>
    set((s) => {
      const list = [...s.content.sections];
      const i = list.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return s;
      [list[i], list[j]] = [list[j], list[i]];
      return { content: { ...s.content, sections: list } };
    }),
  upsertOffer: (offer) =>
    set((s) => {
      const exists = s.content.offers.some((o) => o.id === offer.id);
      return { content: { ...s.content, offers: exists ? s.content.offers.map((o) => (o.id === offer.id ? offer : o)) : [...s.content.offers, offer] } };
    }),
  deleteOffer: (id) => set((s) => ({ content: { ...s.content, offers: s.content.offers.filter((o) => o.id !== id) } })),
  updateSettings: (section, patch) => set((s) => ({ settings: { ...s.settings, [section]: { ...s.settings[section], ...patch } } })),
  upsertCoupon: (coupon) =>
    set((s) => ({ coupons: s.coupons.some((c) => c.code === coupon.code) ? s.coupons.map((c) => (c.code === coupon.code ? coupon : c)) : [...s.coupons, coupon] })),
  deleteCoupon: (code) => set((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) })),
  bumpCoupon: (code) => set((s) => ({ coupons: s.coupons.map((c) => (c.code === code ? { ...c, usageCount: c.usageCount + 1 } : c)) })),
  subscribe: (email) => set((s) => ({ newsletter: [...s.newsletter, { email, at: new Date().toISOString() }] })),
}));
