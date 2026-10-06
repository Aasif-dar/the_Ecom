import { SEED_CATEGORIES, COLLECTIONS } from "./categories";
import { buildBaseProducts } from "./products";
import { SEED_USERS } from "./users";
import { applyRatings, buildReviews } from "./reviews";
import { buildNotifications, buildOrders } from "./orders";
import { SEED_COUPONS, SEED_SETTINGS } from "./settings";
import { SEED_CONTENT } from "./content";

function buildSeed() {
  const base = buildBaseProducts();
  const reviews = buildReviews(base, SEED_USERS);
  const products = applyRatings(base, reviews);
  const orders = buildOrders(products, SEED_USERS);
  const notifications = buildNotifications(orders, products);
  return {
    products,
    reviews,
    users: SEED_USERS,
    orders,
    notifications,
    categories: SEED_CATEGORIES,
    collections: COLLECTIONS,
    coupons: SEED_COUPONS,
    content: SEED_CONTENT,
    settings: SEED_SETTINGS,
  };
}

/** Deterministic: identical on server and client. Stores start from this and rehydrate on mount. */
export const SEED = buildSeed();
