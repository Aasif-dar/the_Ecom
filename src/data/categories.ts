import type { Category, Collection } from "@/types";

const sub = (categoryId: string, slug: string, name: string) => ({
  id: `sub_${categoryId.replace("cat_", "")}_${slug}`,
  slug,
  name,
  categoryId,
  status: "active" as const,
});

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat_women",
    slug: "women",
    name: "Women",
    description: "Dresses, ethnic edits, tailoring and knitwear in honest fabrics.",
    image: "/images/editorial/cat-women.jpg",
    status: "active",
    subcategories: [
      sub("cat_women", "ethnic", "Ethnic Wear"),
      sub("cat_women", "dresses", "Dresses"),
      sub("cat_women", "tops", "Tops & Shirts"),
      sub("cat_women", "knitwear", "Knitwear & Sweats"),
      sub("cat_women", "bottoms", "Trousers & Denim"),
      sub("cat_women", "outerwear", "Coats & Jackets"),
    ],
  },
  {
    id: "cat_men",
    slug: "men",
    name: "Men",
    description: "Everyday shirts, festive kurtas and sharp tailoring.",
    image: "/images/editorial/cat-men.jpg",
    status: "active",
    subcategories: [
      sub("cat_men", "shirts", "Shirts"),
      sub("cat_men", "tees", "T-Shirts & Polos"),
      sub("cat_men", "kurtas", "Kurtas"),
      sub("cat_men", "outerwear", "Jackets & Blazers"),
      sub("cat_men", "sweats", "Hoodies & Sweatshirts"),
      sub("cat_men", "bottoms", "Trousers & Denim"),
    ],
  },
  {
    id: "cat_footwear",
    slug: "footwear",
    name: "Footwear",
    description: "Leather and suede, built to be resoled.",
    image: "/images/editorial/cat-footwear.jpg",
    status: "active",
    subcategories: [
      sub("cat_footwear", "heels", "Heels"),
      sub("cat_footwear", "boots", "Boots"),
      sub("cat_footwear", "formal", "Formal Shoes"),
      sub("cat_footwear", "sneakers", "Sneakers"),
    ],
  },
  {
    id: "cat_accessories",
    slug: "accessories",
    name: "Accessories",
    description: "Bags, eyewear, leather goods and jewellery to finish the look.",
    image: "/images/editorial/cat-accessories.jpg",
    status: "active",
    subcategories: [
      sub("cat_accessories", "bags", "Bags"),
      sub("cat_accessories", "eyewear", "Eyewear"),
      sub("cat_accessories", "leather", "Belts & Wallets"),
      sub("cat_accessories", "scarves", "Scarves, Ties & Hats"),
      sub("cat_accessories", "jewellery", "Jewellery"),
    ],
  },
];

export const COLLECTIONS: Collection[] = [
  {
    id: "col_utsav",
    slug: "utsav",
    name: "The Utsav Edit",
    tagline: "Festive, finished by hand",
    description:
      "Chikankari kurtas, Banarasi weaves, zari anarkalis and the jewellery to wear with them. Made for the weeks when the whole family is in one room.",
    image: "/images/editorial/lookbook-utsav.jpg",
  },
  {
    id: "col_denim",
    slug: "denim",
    name: "The Denim Edit",
    tagline: "Rigid, rinsed, rewearable",
    description:
      "Jackets and jeans cut from Indian-woven denim that softens with every wash. The kind of piece you stop counting wears on.",
    image: "/images/editorial/lookbook-denim.jpg",
  },
  {
    id: "col_tailoring",
    slug: "tailoring",
    name: "City Tailoring",
    tagline: "Sharp, without the stiffness",
    description:
      "Blazers, trousers and shirting with a lived-in drape, made for long commutes, longer meetings and dinners that run late.",
    image: "/images/editorial/lookbook-tailoring.jpg",
  },
  {
    id: "col_weekend",
    slug: "weekend",
    name: "Weekend Essentials",
    tagline: "Heavy cotton, easy shapes",
    description:
      "Garment-washed tees, hoodies and sweatshirts in weights that hold their shape. The uniform for slow Sundays.",
    image: "/images/editorial/lookbook-weekend.jpg",
  },
];
