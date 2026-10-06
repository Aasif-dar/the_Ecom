import type { Notification, NotificationKind, Order, OrderStatus } from "@/types";
import { ORDER_STATUS_META } from "./order-meta";
import { formatDate, formatINR } from "./format";

const KIND: Record<OrderStatus, NotificationKind> = {
  processing: "order_placed",
  confirmed: "order_confirmed",
  packed: "order_packed",
  shipped: "order_shipped",
  out_for_delivery: "order_out_for_delivery",
  delivered: "order_delivered",
  cancelled: "order_cancelled",
};

/** Customer-facing notification copy for an order reaching `status`. */
export function customerNotification(order: Order, status: OrderStatus, at: string): Notification {
  const base = `Order ${order.id}`;
  const copy: Record<OrderStatus, { title: string; body: string }> = {
    processing: { title: "Order placed", body: `${base} for ${formatINR(order.total)} has been placed. We'll confirm it shortly.` },
    confirmed: { title: "Your order has been confirmed", body: `${base} is confirmed and will be packed soon.` },
    packed: { title: "Your order is packed", body: `${base} has been quality-checked and packed.` },
    shipped: {
      title: "Your order has been shipped",
      body: `${base} is on its way with ${order.delivery.partner} (${order.delivery.trackingId}). Expected by ${formatDate(order.estimatedDelivery)}.`,
    },
    out_for_delivery: { title: "Your package is out for delivery", body: `${base} will reach you today. Please keep your phone handy.` },
    delivered: { title: "Your order has been delivered", body: `${base} was delivered. We'd love to hear how it fits. Leave a review.` },
    cancelled: {
      title: "Your order has been cancelled",
      body: order.payment.method === "online" ? `${base} was cancelled. Your refund will reach you in 3–5 working days.` : `${base} was cancelled.`,
    },
  };
  return {
    id: `ntf_${order.id}_${status}`,
    recipientId: order.userId,
    kind: KIND[status],
    title: copy[status].title,
    body: copy[status].body,
    href: `/account/orders/${order.id}`,
    read: false,
    createdAt: at,
  };
}

export function adminNewOrderNotification(order: Order): Notification {
  return {
    id: `ntf_admin_${order.id}`,
    recipientId: "admin",
    kind: "order_placed",
    title: `New order ${order.id}`,
    body: `${order.customer.name} placed an order for ${formatINR(order.total)} (${order.items.length} item${order.items.length > 1 ? "s" : ""}, ${order.payment.method === "cod" ? "COD" : "paid online"}).`,
    href: `/admin/orders/${order.id}`,
    read: false,
    createdAt: order.createdAt,
  };
}

/** Returns a new order with the status applied: timeline, payment side-effects. */
export function applyOrderStatus(order: Order, status: OrderStatus, at: string, note?: string): Order {
  if (order.status === status) return order;
  const payment = { ...order.payment };
  if (status === "delivered" && order.payment.method === "cod") payment.status = "paid";
  if (status === "cancelled") payment.status = order.payment.method === "online" ? "refunded" : "pending";
  return {
    ...order,
    status,
    payment,
    timeline: [...order.timeline, { status, at, note: note ?? ORDER_STATUS_META[status].customerMessage }],
  };
}

export function statusLabel(status: OrderStatus) {
  return ORDER_STATUS_META[status].label;
}
