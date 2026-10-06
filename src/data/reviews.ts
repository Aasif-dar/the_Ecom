import type { Product, Review, User } from "@/types";
import { DAY, SEED_NOW } from "./seed-config";
import { chance, hashString, int, mulberry32, pick } from "@/lib/rng";

type Pool = { title: string; body: string }[];

const APPAREL: Record<"hi" | "mid" | "lo", Pool> = {
  hi: [
    { title: "Better than the photos", body: "The fabric feels far more premium than the price suggests. Stitching is clean and the colour matches the pictures exactly." },
    { title: "Exactly what I wanted", body: "Fits true to size and drapes beautifully. I've already received two compliments on it." },
    { title: "Quietly excellent", body: "No logos, no fuss. The cut is flattering, the fabric breathes, and it has held up through several washes." },
    { title: "Worth every rupee", body: "Ordered on a whim and I'm glad I did. Delivery was quick and the packaging was lovely." },
    { title: "My new favourite", body: "Soft, well finished and surprisingly versatile. I've worn it three times this week." },
    { title: "Great quality", body: "The weight of the fabric is just right. Nothing feels cheap, and the finishing on the seams is neat." },
    { title: "Lovely colour", body: "The colour is rich and looks the same in daylight. Washed once, no fading or shrinkage." },
    { title: "Perfect fit", body: "I sized up as suggested in the reviews and it fits perfectly. Comfortable enough for a full day." },
  ],
  mid: [
    { title: "Good, with one caveat", body: "Lovely fabric and finish, but it runs slightly large. Consider sizing down if you are between sizes." },
    { title: "Nice but a little thin", body: "Looks great and fits well. The fabric is on the lighter side, so best for warmer days." },
    { title: "Solid purchase", body: "Does what it says. Colour is a shade darker than the photos, but I like it." },
  ],
  lo: [
    { title: "Sizing was off for me", body: "Quality is good but the fit didn't work on me. The exchange process was easy, though." },
    { title: "Expected a bit more", body: "It's fine for the price, but the colour looked richer online. Customer care was helpful." },
  ],
};

const FOOTWEAR: Record<"hi" | "mid" | "lo", Pool> = {
  hi: [
    { title: "Comfortable from day one", body: "No break-in pain at all. The leather is soft, the sole has good grip, and the finish is clean." },
    { title: "Beautifully made", body: "The craftsmanship is obvious up close. Fits true to size and looks sharper than the photos." },
    { title: "Worth the splurge", body: "I wore them to a wedding and then a day at work. Still comfortable, and they've held up well." },
    { title: "Great fit", body: "True to size, with a well-cushioned insole. I've already bought a second colour." },
  ],
  mid: [
    { title: "Great looks, tight at first", body: "Looks lovely, and needed a few wears to soften. Worth it, but go half a size up if your feet are wide." },
    { title: "Good value", body: "Well made for the price. The sole is a bit stiff at first." },
  ],
  lo: [{ title: "Narrow fit", body: "Beautiful shoe but narrower than I expected. Exchange for a larger size was smooth." }],
};

const ACCESSORY: Record<"hi" | "mid" | "lo", Pool> = {
  hi: [
    { title: "Looks far more expensive", body: "The finish and weight are lovely. It arrived beautifully packaged in a dust bag, and it's a great gift." },
    { title: "Exactly as pictured", body: "Colour, texture and size are exactly as shown. I've been wearing it every day." },
    { title: "Lovely quality", body: "The detailing is lovely and it feels sturdy. I've received many compliments." },
    { title: "Perfect everyday piece", body: "Goes with everything I own. Well made, and the packaging was thoughtful." },
  ],
  mid: [
    { title: "Nice, a touch smaller", body: "Beautiful finish. It's a bit smaller than I imagined, so check the dimensions before ordering." },
    { title: "Good for the price", body: "Lovely design and good finish. I wish it came in more colours." },
  ],
  lo: [{ title: "Smaller than expected", body: "Nice quality but smaller than I had pictured. Returned without any trouble." }],
};

function poolFor(product: Product) {
  if (product.categoryId === "cat_footwear") return FOOTWEAR;
  if (product.categoryId === "cat_accessories") return ACCESSORY;
  return APPAREL;
}

export function buildReviews(products: Product[], customers: User[]): Review[] {
  const out: Review[] = [];
  const pool = customers.filter((c) => c.role === "customer" && c.status === "active");
  for (const product of products) {
    const rng = mulberry32(hashString(product.slug + ":reviews"));
    const n = Math.min(14, 3 + Math.floor(Math.sqrt(product.unitsSold) / 6));
    const target = 4.0 + rng() * 0.75; // 4.0 – 4.75
    const texts = poolFor(product);
    const used = new Set<string>();
    for (let i = 0; i < n; i++) {
      const rating = Math.max(1, Math.min(5, Math.round(target + (rng() - 0.5) * 1.9)));
      const bucket = rating >= 4 ? "hi" : rating === 3 ? "mid" : "lo";
      const list = texts[bucket];
      let t = pick(rng, list);
      let guard = 0;
      while (used.has(t.title) && guard++ < 6) t = pick(rng, list);
      used.add(t.title);
      const author = pick(rng, pool);
      const nameParts = author.name.split(" ");
      out.push({
        id: `rev_${product.slug}_${i + 1}`,
        productId: product.id,
        userId: author.id,
        userName: `${nameParts[0]} ${nameParts[1]?.[0] ?? ""}.`.trim(),
        rating,
        title: t.title,
        body: t.body,
        createdAt: new Date(SEED_NOW - int(rng, 5, 330) * DAY).toISOString(),
        verified: chance(rng, 0.88),
        helpful: int(rng, 0, 24),
      });
    }
  }
  return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function applyRatings(products: Product[], reviews: Review[]): Product[] {
  const sums = new Map<string, { total: number; count: number }>();
  for (const r of reviews) {
    const s = sums.get(r.productId) ?? { total: 0, count: 0 };
    s.total += r.rating;
    s.count += 1;
    sums.set(r.productId, s);
  }
  return products.map((p) => {
    const s = sums.get(p.id);
    return s ? { ...p, rating: Math.round((s.total / s.count) * 10) / 10, reviewCount: s.count } : p;
  });
}
