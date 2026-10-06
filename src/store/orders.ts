"use client";

import { toast } from "sonner";
import type { Address, Notification, Order, OrderStatus, PaymentMethod, Product, User } from "@/types";
import { SEED } from "@/data/seed";
import { createPersisted } from "./persist";
import { useCatalogStore } from "./catalog";
import { useCartStore } from "./cart";
import { useSiteStore } from "./site";
import { computeTotals, validateCoupon } from "@/lib/pricing";
import { adminNewOrderNotification, applyOrderStatus, customerNotification } from "@/lib/order-actions";
import { COURIER_PARTNERS } from "@/lib/order-meta";
import { hashString } from "@/lib/rng";

export interface PlaceOrderInput {
  user: User;
  address: Address;
  lines: { product: Product; color: string; size: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  payment?: { instrument?: string; transactionId?: string };
}

interface OrderState {
  orders: Order[];
  notifications: Notification[];

  placeOrder: (input: PlaceOrderInput) => Order;
  updateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, note?: string) => void;
  updateDelivery: (orderId: string, patch: Partial<Order["delivery"]> & { estimatedDelivery?: string }) => void;

  markRead: (id: string) => void;
  markAllRead: (recipientId: string) => void;
  clearNotifications: (recipientId: string) => void;
}

/** Marks orders placed through this storefront session (as opposed to seeded history). */
export const PLACED_NOTE = "Order placed successfully.";
export const AUTO_CONFIRM_MS = 7000;

const METROS = new Set(["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "Haryana"]);
const DAY = 24 * 60 * 60 * 1000;

function nextSeq(orders: Order[]) {
  let max = 1000;
  for (const o of orders) {
    const n = Number(o.id.split("-")[2]);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max + 1;
}

function idFor(now: number, seq: number) {
  const d = new Date(now + 5.5 * 3600 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `AAD-${String(d.getUTCFullYear()).slice(2)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${seq}`;
}

export const useOrderStore = createPersisted<OrderState>("orders", (set, get) => ({
  orders: SEED.orders,
  notifications: SEED.notifications,

  placeOrder: (input) => {
    const { user, address, lines, paymentMethod, couponCode } = input;
    const site = useSiteStore.getState();
    const coupon = couponCode ? site.coupons.find((c) => c.code === couponCode) : undefined;
    const now = Date.now();
    const items = lines.map(({ product, color, size, quantity }) => ({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      color,
      size,
      price: product.price,
      mrp: product.mrp,
      quantity,
      sku: product.variants.find((v) => v.color === color && v.size === size)?.sku ?? product.sku,
    }));
    const totals = computeTotals(items, { coupon, store: site.settings.store, paymentMethod, now });
    const couponApplied = coupon && validateCoupon(coupon, totals.subtotal - totals.productSavings, now).ok;
    const partner = COURIER_PARTNERS[hashString(address.pincode) % COURIER_PARTNERS.length];
    const online = paymentMethod === "online";
    const order: Order = {
      id: idFor(now, nextSeq(get().orders)),
      userId: user.id,
      customer: { name: user.name, email: user.email, phone: user.phone },
      items,
      address,
      payment: {
        method: paymentMethod,
        status: online ? "paid" : "pending",
        instrument: online ? input.payment?.instrument ?? "UPI" : "Cash on delivery",
        transactionId: online ? input.payment?.transactionId ?? `pay_${now.toString(36).toUpperCase()}` : undefined,
      },
      subtotal: totals.subtotal,
      discount: totals.discount,
      couponCode: couponApplied ? coupon!.code : undefined,
      shipping: totals.shipping,
      codFee: totals.codFee,
      tax: totals.tax,
      total: totals.total,
      status: "processing",
      timeline: [{ status: "processing", at: new Date(now).toISOString(), note: PLACED_NOTE }],
      createdAt: new Date(now).toISOString(),
      estimatedDelivery: new Date(now + (METROS.has(address.state) ? 4 : 6) * DAY).toISOString(),
      delivery: { partner, trackingId: `${partner.slice(0, 3).toUpperCase()}${String(now).slice(-10)}` },
    };

    // reserve stock, notify, clear the bag
    useCatalogStore.getState().adjustStock(
      lines.map((l) => ({ productId: l.product.id, color: l.color, size: l.size, quantity: l.quantity })),
      -1,
    );
    set((s) => ({
      orders: [order, ...s.orders],
      notifications: [customerNotification(order, "processing", order.createdAt), adminNewOrderNotification(order), ...s.notifications],
    }));
    if (couponApplied) site.bumpCoupon(coupon!.code);
    useCartStore.getState().clear();

    // (The demo "warehouse" auto-confirms new orders a few seconds later: see AutoConfirmWatcher in providers.)
    return order;
  },

  updateStatus: (orderId, status, note) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order || order.status === status) return;
    const at = new Date().toISOString();
    const updated = applyOrderStatus(order, status, at, note);
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? updated : o)),
      notifications: [{ ...customerNotification(updated, status, at), id: `ntf_${orderId}_${status}_${Date.now()}` }, ...s.notifications],
    }));
    if (status === "cancelled" && order.status !== "cancelled") {
      useCatalogStore.getState().adjustStock(
        order.items.map((i) => ({ productId: i.productId, color: i.color, size: i.size, quantity: i.quantity })),
        1,
      );
    }
  },

  cancelOrder: (orderId, note) => {
    const order = get().orders.find((o) => o.id === orderId);
    if (!order) return;
    if (!["processing", "confirmed", "packed"].includes(order.status)) {
      toast.error("This order has already shipped and can no longer be cancelled.");
      return;
    }
    get().updateStatus(orderId, "cancelled", note ?? "Cancelled at your request.");
  },

  updateDelivery: (orderId, patch) =>
    set((s) => ({
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const { estimatedDelivery, ...delivery } = patch;
        return { ...o, estimatedDelivery: estimatedDelivery ?? o.estimatedDelivery, delivery: { ...o.delivery, ...delivery } };
      }),
    })),

  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: (recipientId) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.recipientId === recipientId ? { ...n, read: true } : n)) })),
  clearNotifications: (recipientId) => set((s) => ({ notifications: s.notifications.filter((n) => n.recipientId !== recipientId) })),
}));
