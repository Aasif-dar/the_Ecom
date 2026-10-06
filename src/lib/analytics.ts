import type { AdminAnalytics, Category, Order, Product, TimePoint, User } from "@/types";
import { LOW_STOCK_THRESHOLD, totalStock } from "./product-utils";
import { SEED_NOW } from "@/data/seed-config";

const DAY = 24 * 60 * 60 * 1000;
const IST = 5.5 * 60 * 60 * 1000;

const dayKey = (ms: number) => Math.floor((ms + IST) / DAY);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthIndexOf(ms: number) {
  const d = new Date(ms + IST);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}
function monthLabel(idx: number) {
  return `${MONTHS[idx % 12]} '${String(Math.floor(idx / 12)).slice(2)}`;
}

/** Orders that count toward revenue */
const counts = (o: Order) => o.status !== "cancelled";

/**
 * Derives the whole back-office view from live orders, so anything an admin or
 * customer does in the demo is reflected on the dashboard immediately.
 */
export function computeAnalytics(
  orders: Order[],
  products: Product[],
  users: User[],
  categories: Category[],
  now: number = Date.now(),
): AdminAnalytics {
  // The series are anchored on the later of the seed date and "now" so a fresh order always appears.
  const anchor = Math.max(SEED_NOW, now);
  const valid = orders.filter(counts);
  const customers = users.filter((u) => u.role === "customer");

  const netRevenue = (o: Order) => o.total - (o.tax ?? 0);
  const totalRevenue = valid.reduce((s, o) => s + netRevenue(o), 0);
  const totalSales = valid.reduce((s, o) => s + o.total, 0);

  // ----- time series -----
  const dayBuckets = new Map<number, { revenue: number; orders: number }>();
  for (const o of valid) {
    const k = dayKey(+new Date(o.createdAt));
    const b = dayBuckets.get(k) ?? { revenue: 0, orders: 0 };
    b.revenue += netRevenue(o);
    b.orders += 1;
    dayBuckets.set(k, b);
  }
  const todayKey = dayKey(anchor);
  const dayLabel = (k: number) => {
    const d = new Date(k * DAY);
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  };

  const revenueDaily: TimePoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const k = todayKey - i;
    const b = dayBuckets.get(k);
    revenueDaily.push({ label: dayLabel(k), revenue: b?.revenue ?? 0, orders: b?.orders ?? 0 });
  }

  const revenueWeekly: TimePoint[] = [];
  for (let w = 11; w >= 0; w--) {
    let revenue = 0, ordersN = 0;
    for (let d = 0; d < 7; d++) {
      const b = dayBuckets.get(todayKey - w * 7 - d);
      if (b) { revenue += b.revenue; ordersN += b.orders; }
    }
    revenueWeekly.push({ label: dayLabel(todayKey - w * 7 - 6), revenue, orders: ordersN });
  }

  const nowMonth = monthIndexOf(anchor);
  const monthBuckets = new Map<number, { revenue: number; orders: number }>();
  for (const o of valid) {
    const m = monthIndexOf(+new Date(o.createdAt));
    const b = monthBuckets.get(m) ?? { revenue: 0, orders: 0 };
    b.revenue += netRevenue(o);
    b.orders += 1;
    monthBuckets.set(m, b);
  }
  const revenueMonthly: TimePoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const m = nowMonth - i;
    const b = monthBuckets.get(m);
    revenueMonthly.push({ label: monthLabel(m), revenue: b?.revenue ?? 0, orders: b?.orders ?? 0 });
  }

  // yearly: prior financial years are legacy figures from before the demo's order history begins
  const trailing = revenueMonthly.reduce(
    (a, p) => ({ revenue: a.revenue + p.revenue, orders: a.orders + p.orders }),
    { revenue: 0, orders: 0 },
  );
  const revenueYearly: TimePoint[] = [
    { label: "FY 2023–24", revenue: 612000, orders: 168 },
    { label: "FY 2024–25", revenue: 1384000, orders: 301 },
    { label: "Last 12 months", revenue: trailing.revenue, orders: trailing.orders },
  ];

  // ----- customer growth (monthly) -----
  const firstOrderMonth = new Map<string, number>();
  const monthCustomers = new Map<number, Set<string>>();
  for (const o of [...valid].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))) {
    const m = monthIndexOf(+new Date(o.createdAt));
    if (!firstOrderMonth.has(o.userId)) firstOrderMonth.set(o.userId, m);
    const set = monthCustomers.get(m) ?? new Set();
    set.add(o.userId);
    monthCustomers.set(m, set);
  }
  const customerGrowth: AdminAnalytics["customerGrowth"] = [];
  for (let i = 11; i >= 0; i--) {
    const m = nowMonth - i;
    const newCustomers = customers.filter((u) => monthIndexOf(+new Date(u.createdAt)) === m).length;
    const set = monthCustomers.get(m) ?? new Set<string>();
    let returning = 0;
    set.forEach((id) => {
      if ((firstOrderMonth.get(id) ?? m) < m) returning += 1;
    });
    customerGrowth.push({ label: monthLabel(m), newCustomers, returning });
  }

  // ----- categories & products -----
  const productById = new Map(products.map((p) => [p.id, p]));
  const catRevenue = new Map<string, { revenue: number; units: number }>();
  const prodStats = new Map<string, { units: number; revenue: number }>();
  for (const o of valid) {
    for (const it of o.items) {
      const p = productById.get(it.productId);
      const catName = categories.find((c) => c.id === p?.categoryId)?.name ?? "Other";
      const c = catRevenue.get(catName) ?? { revenue: 0, units: 0 };
      c.revenue += it.price * it.quantity;
      c.units += it.quantity;
      catRevenue.set(catName, c);
      const s = prodStats.get(it.productId) ?? { units: 0, revenue: 0 };
      s.units += it.quantity;
      s.revenue += it.price * it.quantity;
      prodStats.set(it.productId, s);
    }
  }
  const salesByCategory = [...catRevenue.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  const topProducts = [...prodStats.entries()]
    .map(([productId, s]) => {
      const p = productById.get(productId);
      return { productId, name: p?.name ?? "Removed product", image: p?.images[0] ?? "", ...s };
    })
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);

  const stockRows = products
    .filter((p) => p.status !== "archived")
    .map((p) => ({ p, stock: totalStock(p) }));
  const lowStock = stockRows
    .filter((r) => r.stock > 0 && r.stock <= LOW_STOCK_THRESHOLD * 2)
    .sort((a, b) => a.stock - b.stock)
    .map((r) => ({ productId: r.p.id, name: r.p.name, image: r.p.images[0], stock: r.stock }));
  const outOfStock = stockRows
    .filter((r) => r.stock === 0)
    .map((r) => ({ productId: r.p.id, name: r.p.name, image: r.p.images[0] }));

  const statusCounts = new Map<string, number>();
  for (const o of orders) statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
  const orderStatus = [...statusCounts.entries()].map(([status, count]) => ({ status: status as Order["status"], count }));

  const signups = (from: number, to: number) => customers.filter((u) => { const t = +new Date(u.createdAt); return t > anchor - to * DAY && t <= anchor - from * DAY; }).length;
  const newCustomers30 = signups(0, 30);
  const newPrev30 = signups(30, 60);
  const newCustomersTrend = newPrev30 ? Math.round(((newCustomers30 - newPrev30) / newPrev30) * 1000) / 10 : 0;

  const pendingOrders = orders.filter((o) => ["processing", "confirmed", "packed"].includes(o.status)).length;

  return {
    totals: {
      sales: totalSales,
      revenue: totalRevenue,
      orders: orders.length,
      customers: customers.length,
      products: products.filter((p) => p.status !== "archived").length,
      pendingOrders,
      averageOrderValue: valid.length ? Math.round(totalSales / valid.length) : 0,
      newCustomersTrend,
      newCustomers30,
    },
    revenueDaily,
    revenueWeekly,
    revenueMonthly,
    revenueYearly,
    customerGrowth,
    salesByCategory,
    topProducts,
    orderStatus,
    lowStock,
    outOfStock,
  };
}

/** % change between the last N points and the N before them */
export function trendOf(series: number[], window = 14): number {
  const recent = series.slice(-window).reduce((a, b) => a + b, 0);
  const prior = series.slice(-window * 2, -window).reduce((a, b) => a + b, 0);
  if (!prior) return 0;
  return Math.round(((recent - prior) / prior) * 1000) / 10;
}
