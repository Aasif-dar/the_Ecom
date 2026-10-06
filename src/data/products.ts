import type { Product, SizeGuideKind, Variant } from "@/types";
import { ROWS, type CatKey, type SizeKey } from "./product-rows";
import { COLOR_HEX } from "./colors";
import { PRODUCT_IMAGE_COUNT } from "./image-manifest";
import { SEED_NOW, DAY } from "./seed-config";
import { hashString, int, mulberry32 } from "@/lib/rng";

const SIZE_SETS: Record<SizeKey, { sizes: string[]; guide: SizeGuideKind }> = {
  TM: { sizes: ["S", "M", "L", "XL", "XXL"], guide: "tops" },
  TW: { sizes: ["XS", "S", "M", "L", "XL"], guide: "tops" },
  WM: { sizes: ["30", "32", "34", "36", "38"], guide: "bottoms" },
  WW: { sizes: ["26", "28", "30", "32", "34"], guide: "bottoms" },
  SM: { sizes: ["40", "41", "42", "43", "44"], guide: "footwear" },
  SW: { sizes: ["36", "37", "38", "39", "40"], guide: "footwear" },
  ONE: { sizes: ["One Size"], guide: "free" },
  BELT: { sizes: ["32", "34", "36", "38"], guide: "free" },
};

// Trousers & jeans use waist sizes even though their rows say "TM"/"TW"-style sets.
const WAIST_OVERRIDE: Record<string, SizeKey> = {
  "glen-check-tapered-trousers": "WM",
  "stone-slim-chinos": "WM",
  "utility-cargo-trousers": "WM",
  "dark-indigo-straight-jeans": "WM",
};

const CAT_CODE: Record<CatKey, string> = { women: "WMN", men: "MEN", footwear: "FTW", accessories: "ACC" };

const CARE: Record<string, string> = {
  ethnic: "Dry clean only. Store folded in a muslin cloth, away from direct sunlight.",
  dresses: "Machine wash cold on a gentle cycle. Dry in shade. Warm iron on the reverse.",
  tops: "Machine wash cold with similar colours. Dry in shade. Medium iron.",
  knitwear: "Hand wash cold or dry clean. Dry flat. Do not wring or tumble dry.",
  bottoms: "Machine wash cold, inside out. Dry in shade. Iron on medium heat.",
  outerwear: "Dry clean only. Steam to refresh. Store on a wide hanger.",
  shirts: "Machine wash cold. Tumble dry low. Iron while slightly damp.",
  tees: "Machine wash cold, inside out. Do not bleach. Dry in shade.",
  kurtas: "Gentle hand wash or dry clean. Dry in shade. Iron on the reverse at low heat.",
  sweats: "Machine wash cold, inside out. Tumble dry low. Do not iron over prints.",
  heels: "Wipe with a soft dry cloth. Use a suede brush on suede. Store in the dust bag.",
  boots: "Brush off dirt, condition leather monthly. Keep away from prolonged moisture.",
  formal: "Polish with a neutral cream. Use shoe trees to keep the shape. Rotate wear.",
  sneakers: "Wipe clean with a damp cloth. Air dry away from direct heat.",
  bags: "Wipe with a soft dry cloth. Avoid water. Stuff lightly and store in the dust bag.",
  eyewear: "Clean lenses with the microfibre cloth. Store in the hard case provided.",
  leather: "Condition occasionally with a leather balm. Keep away from water and heat.",
  scarves: "Hand wash cold or dry clean. Dry flat.",
  jewellery: "Avoid perfume, water and chemicals. Wipe with a soft cloth. Store in the pouch provided.",
};

const STYLING: Record<string, string> = {
  ethnic: "Wear it with jhumkas and kolhapuris for the day, or swap in statement jewellery and heels for the evening.",
  dresses: "Wear with flats or sneakers by day; add heels and a clutch for dinner.",
  tops: "Tuck into high-waisted trousers or wear loose over denim. It layers well under a blazer.",
  knitwear: "Layer over a tee or a slip dress. The shape is relaxed, so size down if you want it closer to the body.",
  bottoms: "Cut to sit at the natural waist. Wear with a tucked-in tee or a tailored shirt.",
  outerwear: "Built to layer. Over a knit in winter, or over a tee when the evenings turn cooler.",
  shirts: "Wear buttoned to the top with trousers, or open over a tee with denim.",
  tees: "A building block: under a blazer, with chinos or on its own with denim.",
  kurtas: "Pair with ivory pyjamas and kolhapuris for pooja, or with dark denim and loafers for a casual dinner.",
  sweats: "Pair with straight-leg denim and sneakers. Sized for a relaxed, layered fit.",
  heels: "Pair with tailored trousers, a slip dress or a saree.",
  boots: "Wear with straight-leg trousers, midi skirts or over skinny denim.",
  formal: "Wear with tailored trousers or well-cut chinos. Quietly polished.",
  sneakers: "Goes with dresses, denim and trousers alike. Easy to live in.",
  bags: "Sized to hold a phone, wallet, keys and a few essentials without losing its shape.",
  eyewear: "Includes a hard case and a microfibre cloth. 100% UVA/UVB protection.",
  leather: "Develops a patina with use. Made to be worn for years, not seasons.",
  scarves: "Wear it knotted, looped or draped. Soft enough to sleep in on a flight.",
  jewellery: "Hypoallergenic and water-resistant. Made to be worn every day, not saved for occasions.",
};

const ORIGIN: Record<string, string> = {
  ethnic: "Lucknow and Varanasi", dresses: "Jaipur", tops: "Bengaluru", knitwear: "Ludhiana", bottoms: "Tiruppur",
  outerwear: "Delhi NCR", shirts: "Tiruppur", tees: "Tiruppur", kurtas: "Lucknow", sweats: "Ludhiana",
  heels: "Agra", boots: "Kanpur", formal: "Agra", sneakers: "Agra", bags: "Kolkata", eyewear: "Bhiwadi",
  leather: "Kanpur", scarves: "Ludhiana", jewellery: "Jaipur",
};

const MODEL_NOTE: Record<CatKey, string | null> = {
  women: "Model is 5'8\" and wears size S.",
  men: "Model is 6'0\" and wears size M.",
  footwear: null,
  accessories: null,
};

const OUT_OF_STOCK = new Set(["crimson-evening-gown"]);
const LOW_STOCK = new Set([
  "windowpane-three-piece-suit", "washed-leather-biker-jacket", "asymmetric-wool-coat-grey",
  "espresso-lace-up-boots", "zari-anarkali-set-ivory", "patchwork-check-overcoat",
]);

function colorCode(name: string) {
  return name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
}

function buildVariants(slug: string, num: number, cat: CatKey, colors: string[], sizes: string[]): Variant[] {
  const rng = mulberry32(hashString(slug));
  const out: Variant[] = [];
  for (const color of colors) {
    for (const size of sizes) {
      let stock: number;
      if (OUT_OF_STOCK.has(slug)) stock = 0;
      else if (LOW_STOCK.has(slug)) stock = int(rng, 0, 3);
      else {
        const r = rng();
        stock = r < 0.12 ? 0 : r < 0.28 ? int(rng, 1, 3) : int(rng, 5, 24);
      }
      out.push({
        id: `${slug}:${color}:${size}`,
        sku: `AAD-${CAT_CODE[cat]}-${String(num).padStart(3, "0")}-${colorCode(color)}-${size.replace(/\s/g, "")}`,
        color,
        size,
        stock,
      });
    }
  }
  // Guarantee at least one purchasable variant for products that aren't meant to be sold out.
  if (!OUT_OF_STOCK.has(slug) && out.every((v) => v.stock === 0)) out[0].stock = 6;
  return out;
}

export function buildBaseProducts(): Product[] {
  return ROWS.map((row, i) => {
    const [slug, name, cat, sub, price, mrp, colorNames, sizeKey, blurb, fabric, fit, tags, col, flags, sold, age] = row;
    const effKey = WAIST_OVERRIDE[slug] ?? sizeKey;
    const set = SIZE_SETS[effKey];
    const num = i + 1;
    const imgCount = PRODUCT_IMAGE_COUNT[slug] ?? 1;
    const images = Array.from({ length: imgCount }, (_, k) => `/images/products/${slug}-${k + 1}.jpg`);
    const modelNote = MODEL_NOTE[cat];
    const details = [
      `Fabric: ${fabric}`,
      `Fit: ${fit}`,
      `Care: ${CARE[sub]}`,
      `Made in ${ORIGIN[sub]}, India`,
      ...(modelNote && effKey !== "ONE" ? [modelNote] : []),
    ];
    const description = `${blurb}\n\n${STYLING[sub]}\n\nDesigned in Mumbai and made in small runs in ${ORIGIN[sub]}, so quantities are limited. Prices include GST.`;
    return {
      id: `prd_${String(num).padStart(3, "0")}`,
      slug,
      name,
      description,
      shortDescription: blurb,
      categoryId: `cat_${cat}`,
      subcategoryId: `sub_${cat}_${sub}`,
      price,
      mrp,
      sku: `AAD-${CAT_CODE[cat]}-${String(num).padStart(3, "0")}`,
      images,
      colors: colorNames.map((n) => ({ name: n, hex: COLOR_HEX[n] ?? "#8D8A82" })),
      sizes: set.sizes,
      variants: buildVariants(slug, num, cat, colorNames, set.sizes),
      tags: tags.split(",").map((t) => t.trim()),
      collections: col ? col.split(",") : [],
      fabric,
      fit,
      care: CARE[sub],
      details,
      sizeGuide: set.guide,
      rating: 0,
      reviewCount: 0,
      isNew: flags.includes("N"),
      isBestSeller: flags.includes("B"),
      isFeatured: flags.includes("F"),
      status: "active",
      unitsSold: sold,
      createdAt: new Date(SEED_NOW - age * DAY).toISOString(),
    } satisfies Product;
  });
}
