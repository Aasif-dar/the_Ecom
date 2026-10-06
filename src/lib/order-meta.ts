import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types";

export const ORDER_FLOW: OrderStatus[] = [
  "processing",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const ALL_ORDER_STATUSES: OrderStatus[] = [...ORDER_FLOW, "cancelled"];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; short: string; tone: "neutral" | "info" | "progress" | "success" | "danger"; customerMessage: string }
> = {
  processing: { label: "Processing", short: "Processing", tone: "neutral", customerMessage: "We've received your order and are getting it ready." },
  confirmed: { label: "Confirmed", short: "Confirmed", tone: "info", customerMessage: "Your order has been confirmed." },
  packed: { label: "Packed", short: "Packed", tone: "info", customerMessage: "Your order has been carefully packed." },
  shipped: { label: "Shipped", short: "Shipped", tone: "progress", customerMessage: "Your order has been shipped." },
  out_for_delivery: { label: "Out for Delivery", short: "Out for delivery", tone: "progress", customerMessage: "Your package is out for delivery." },
  delivered: { label: "Delivered", short: "Delivered", tone: "success", customerMessage: "Your order has been delivered." },
  cancelled: { label: "Cancelled", short: "Cancelled", tone: "danger", customerMessage: "Your order has been cancelled." },
};

export const TRACKING_STEPS: { status: OrderStatus; label: string; detail: string }[] = [
  { status: "confirmed", label: "Order Confirmed", detail: "We've accepted your order" },
  { status: "packed", label: "Packed", detail: "Quality-checked and packed" },
  { status: "shipped", label: "Shipped", detail: "Handed to the courier" },
  { status: "out_for_delivery", label: "Out for Delivery", detail: "With the delivery partner" },
  { status: "delivered", label: "Delivered", detail: "Handed over to you" },
];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  online: "Online payment",
  cod: "Cash on delivery",
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: "success" | "neutral" | "danger" | "info" }> = {
  paid: { label: "Paid", tone: "success" },
  pending: { label: "Pending", tone: "neutral" },
  failed: { label: "Failed", tone: "danger" },
  refunded: { label: "Refunded", tone: "info" },
};

export const COURIER_PARTNERS = ["Delhivery", "Blue Dart", "Ecom Express", "DTDC", "Xpressbees"] as const;

/** Index in the progress flow (cancelled = -1) */
export function statusIndex(status: OrderStatus): number {
  return status === "cancelled" ? -1 : ORDER_FLOW.indexOf(status);
}

export function isOpenOrder(status: OrderStatus) {
  return status !== "delivered" && status !== "cancelled";
}
