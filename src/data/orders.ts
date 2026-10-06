import type { Address, Notification, Order, OrderItem, OrderStatus, OrderTimelineEntry, Product, User } from "@/types";
import { DAY, SEED_NOW } from "./seed-config";
import { SEED_COUPONS, SEED_SETTINGS } from "./settings";
import { computeTotals } from "@/lib/pricing";
import { COURIER_PARTNERS, ORDER_FLOW, ORDER_STATUS_META } from "@/lib/order-meta";
import { adminNewOrderNotification, customerNotification } from "@/lib/order-actions";
import { chance, int, mulberry32, pick, type Rng } from "@/lib/rng";

const HOUR = 60 * 60 * 1000;
const SEASON = [0.9, 1.0, 1.1, 0.9, 0.8, 0.8, 1.0, 1.2, 1.2, 1.5, 1.6, 1.4];
const INSTRUMENTS = ["UPI", "UPI", "Visa •••• 4242", "Mastercard •••• 8812", "HDFC NetBanking", "RuPay •••• 1190", "Google Pay"];
const COURIER_PREFIX: Record<string, string> = { Delhivery: "DLV", "Blue Dart": "BDT", "Ecom Express": "ECM", DTDC: "DTD", Xpressbees: "XBS" };

interface Draft {
  seq: number;
  user: User;
  lines: { product: Product; color: string; size: string; qty: number }[];
  createdAt: number;
  status: OrderStatus;
  method: "online" | "cod";
  couponCode?: string;
  forcedId?: string;
  partner?: string;
}

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

function orderId(ms: number, seq: number) {
  const d = new Date(ms + 5.5 * HOUR); // IST calendar day
  return `AAD-${String(d.getUTCFullYear()).slice(2)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${seq}`;
}

/** Step timings (hours after placement) at which each status is reached. */
function schedule(rng: Rng) {
  const confirmed = 0.5 + rng() * 2.5;
  const packed = confirmed + 8 + rng() * 14;
  const shipped = packed + 10 + rng() * 14;
  const out = shipped + 40 + rng() * 30;
  const delivered = out + 5 + rng() * 7;
  return { processing: 0, confirmed, packed, shipped, out_for_delivery: out, delivered } as Record<string, number>;
}

function buildTimeline(createdAt: number, status: OrderStatus, rng: Rng): OrderTimelineEntry[] {
  const sched = schedule(rng);
  const entries: OrderTimelineEntry[] = [];
  const upTo = status === "cancelled" ? int(rng, 0, 2) : ORDER_FLOW.indexOf(status);
  for (let i = 0; i <= upTo; i++) {
    const s = ORDER_FLOW[i];
    entries.push({
      status: s,
      at: new Date(createdAt + sched[s] * HOUR).toISOString(),
      note: ORDER_STATUS_META[s].customerMessage,
    });
  }
  if (status === "cancelled") {
    const last = new Date(entries[entries.length - 1].at).getTime();
    entries.push({
      status: "cancelled",
      at: new Date(last + (1 + rng() * 5) * HOUR).toISOString(),
      note: pick(rng, ["Cancelled at customer's request.", "Cancelled: customer changed their mind.", "Cancelled: size unavailable at packing."]),
    });
  }
  return entries;
}

/** Pick the lifecycle status of an order from its age. */
function statusForAge(rng: Rng, ageHours: number): OrderStatus {
  if (ageHours > 14 * 24) return chance(rng, 0.06) ? "cancelled" : "delivered";
  if (chance(rng, 0.035)) return "cancelled";
  const sched = schedule(rng);
  let status: OrderStatus = "processing";
  for (const s of ORDER_FLOW) if (ageHours >= sched[s]) status = s;
  return status;
}

function makeOrder(d: Draft, rng: Rng): Order {
  const items: OrderItem[] = d.lines.map(({ product, color, size, qty }) => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    image: product.images[0],
    color,
    size,
    price: product.price,
    mrp: product.mrp,
    quantity: qty,
    sku: product.variants.find((v) => v.color === color && v.size === size)?.sku ?? product.sku,
  }));
  const coupon = d.couponCode ? SEED_COUPONS.find((c) => c.code === d.couponCode) : undefined;
  const totals = computeTotals(items, { coupon, store: SEED_SETTINGS.store, paymentMethod: d.method, now: d.createdAt });
  const timeline = buildTimeline(d.createdAt, d.status, rng);
  const partner = d.partner ?? pick(rng, COURIER_PARTNERS);
  const addr: Address = d.user.addresses.find((a) => a.isDefault) ?? d.user.addresses[0];
  const online = d.method === "online";
  const payment: Order["payment"] = {
    method: d.method,
    status: d.status === "cancelled" ? (online ? "refunded" : "pending") : online ? "paid" : d.status === "delivered" ? "paid" : "pending",
    ...(online ? { transactionId: `pay_${Math.floor(rng() * 1e12).toString(36).toUpperCase().padStart(8, "0")}`, instrument: pick(rng, INSTRUMENTS) } : { instrument: "Cash on delivery" }),
  };
  return {
    id: d.forcedId ?? orderId(d.createdAt, d.seq),
    userId: d.user.id,
    customer: { name: d.user.name, email: d.user.email, phone: d.user.phone },
    items,
    address: addr,
    payment,
    subtotal: totals.subtotal,
    discount: totals.discount,
    couponCode: totals.couponDiscount > 0 ? d.couponCode : undefined,
    shipping: totals.shipping,
    codFee: totals.codFee,
    tax: totals.tax,
    total: totals.total,
    status: d.status,
    timeline,
    createdAt: new Date(d.createdAt).toISOString(),
    estimatedDelivery: new Date(d.createdAt + (5 + (d.seq % 3)) * DAY).toISOString(),
    delivery: { partner, trackingId: `${COURIER_PREFIX[partner]}${String(int(rng, 1e9, 9.99e9))}` },
  };
}

export function buildOrders(products: Product[], users: User[]): Order[] {
  const rng = mulberry32(90210);
  const customers = users.filter((u) => u.role === "customer" && u.id !== "usr_demo");
  const loyal = customers.slice(0, 14);
  const active = products.filter((p) => p.status === "active" && p.variants.some((v) => v.stock > 0));
  const weights = active.map((p) => Math.pow(p.unitsSold, 0.8));
  const total = weights.reduce((a, b) => a + b, 0);
  const pickProduct = () => {
    let r = rng() * total;
    for (let i = 0; i < active.length; i++) {
      r -= weights[i];
      if (r <= 0) return active[i];
    }
    return active[active.length - 1];
  };

  const drafts: Omit<Draft, "seq">[] = [];
  const start = SEED_NOW - 364 * DAY;
  for (let d = 0; d <= 364; d++) {
    const dayStart = start + d * DAY;
    const month = new Date(dayStart).getUTCMonth();
    const mean = 0.82 * SEASON[month] * (0.65 + 0.75 * (d / 364));
    let count = Math.floor(mean) + (rng() < mean - Math.floor(mean) ? 1 : 0);
    if (chance(rng, 0.04)) count += 2;
    for (let k = 0; k < count; k++) {
      const createdAt = dayStart + (-0.5 + rng() * 13.5) * HOUR; // 09:00–22:30 IST (dayStart is 09:30 IST)
      if (createdAt > SEED_NOW - 2 * HOUR) continue;
      const user = chance(rng, 0.33) ? pick(rng, loyal) : pick(rng, customers);
      const nLines = chance(rng, 0.55) ? 1 : chance(rng, 0.65) ? 2 : 3;
      const lines: Draft["lines"] = [];
      const seen = new Set<string>();
      for (let i = 0; i < nLines; i++) {
        const product = pickProduct();
        if (seen.has(product.id)) continue;
        seen.add(product.id);
        const v = pick(rng, product.variants);
        lines.push({ product, color: v.color, size: v.size, qty: chance(rng, 0.14) ? 2 : 1 });
      }
      const merch = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
      let couponCode: string | undefined;
      if (chance(rng, 0.2)) {
        couponCode = pick(rng, ["WELCOME10", "FESTIVE15", "FLAT500", "AADYAM20"]);
        const c = SEED_COUPONS.find((x) => x.code === couponCode)!;
        if (merch < c.minOrder) couponCode = undefined;
      }
      const status = statusForAge(rng, (SEED_NOW - createdAt) / HOUR);
      drafts.push({ user, lines, createdAt, status, method: chance(rng, 0.62) ? "online" : "cod", couponCode });
    }
  }

  // Hand-built orders for the demo customer, spanning every stage of the journey.
  const demo = users.find((u) => u.id === "usr_demo")!;
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const L = (slug: string, color: string, size: string, qty = 1) => ({ product: bySlug.get(slug)!, color, size, qty });
  const demoDrafts: Omit<Draft, "seq">[] = [
    { user: demo, lines: [L("tan-leather-ankle-boots", "Tan", "38"), L("pearl-drop-gold-pendant", "Gold", "One Size")], createdAt: SEED_NOW - 1.2 * HOUR, status: "processing", method: "online", forcedId: "AAD-261006-1500" },
    { user: demo, lines: [L("camel-belted-wrap-coat", "Camel", "S")], createdAt: SEED_NOW - 3.1 * DAY, status: "shipped", method: "online", partner: "Delhivery", forcedId: "AAD-261003-1496" },
    { user: demo, lines: [L("terracotta-slip-midi-dress", "Terracotta", "S"), L("croc-embossed-crossbody-tan", "Tan", "One Size")], createdAt: SEED_NOW - 4.4 * DAY, status: "out_for_delivery", method: "cod", partner: "Blue Dart", forcedId: "AAD-261001-1488" },
    { user: demo, lines: [L("sage-satin-blouse", "Sage", "M"), L("pleated-wide-leg-trousers-sand", "Sand", "M")], createdAt: SEED_NOW - 12.5 * DAY, status: "delivered", method: "online", couponCode: "FESTIVE15", forcedId: "AAD-260923-1431" },
    { user: demo, lines: [L("classic-denim-jacket-women", "Light Denim", "M"), L("essential-crew-tee-white", "White", "M", 2)], createdAt: SEED_NOW - 38 * DAY, status: "delivered", method: "online", forcedId: "AAD-260829-1352" },
    { user: demo, lines: [L("crimson-evening-gown", "Crimson", "S")], createdAt: SEED_NOW - 52 * DAY, status: "cancelled", method: "online", forcedId: "AAD-260815-1318" },
    { user: demo, lines: [L("pearl-button-blouse", "White", "M"), L("high-rise-skinny-jeans", "Light Wash", "28")], createdAt: SEED_NOW - 96 * DAY, status: "delivered", method: "cod", forcedId: "AAD-260702-1204" },
  ];

  const all = [...drafts, ...demoDrafts].sort((a, b) => a.createdAt - b.createdAt);
  const orders: Order[] = [];
  let seq = 1001;
  for (const d of all) {
    const local = mulberry32(Math.floor(d.createdAt / 1000));
    orders.push(makeOrder({ ...d, seq: seq++ }, local));
  }
  return orders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function buildNotifications(orders: Order[], products: Product[]): Notification[] {
  const out: Notification[] = [];
  const demoOrders = orders.filter((o) => o.userId === "usr_demo");
  for (const o of demoOrders) {
    for (const e of o.timeline) {
      if (e.status === "confirmed" && o.timeline.length > 3) continue; // keep the feed readable for older orders
      const n = customerNotification(o, e.status, e.at);
      n.read = SEED_NOW - new Date(e.at).getTime() > 2 * DAY;
      out.push(n);
    }
  }
  out.push({
    id: "ntf_offer_festive",
    recipientId: "usr_demo",
    kind: "offer",
    title: "The Utsav Edit is live",
    body: "Chikankari kurtas, Banarasi silk and zari anarkalis. Use FESTIVE15 for 15% off orders above ₹3,999.",
    href: "/collections/utsav",
    read: true,
    createdAt: new Date(SEED_NOW - 6 * DAY).toISOString(),
  });
  // back-office feed
  for (const o of orders.slice(0, 6)) out.push(adminNewOrderNotification(o));
  for (const p of products) {
    const stock = p.variants.reduce((s, v) => s + v.stock, 0);
    if (stock > 0 && stock <= 8) {
      out.push({
        id: `ntf_admin_low_${p.id}`,
        recipientId: "admin",
        kind: "system",
        title: "Low stock",
        body: `${p.name} has only ${stock} unit${stock > 1 ? "s" : ""} left.`,
        href: `/admin/products/${p.id}`,
        read: false,
        createdAt: new Date(SEED_NOW - 6 * HOUR).toISOString(),
      });
    }
  }
  return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}
