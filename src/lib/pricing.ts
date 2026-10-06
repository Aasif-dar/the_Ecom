import type { Coupon, PaymentMethod, StoreSettings } from "@/types";

export interface PricedLine {
  price: number;
  mrp: number;
  quantity: number;
}

export interface Totals {
  itemCount: number;
  /** sum of MRP × qty ("bag total") */
  subtotal: number;
  /** MRP - selling price, per unit × qty */
  productSavings: number;
  couponDiscount: number;
  /** productSavings + couponDiscount */
  discount: number;
  shipping: number;
  codFee: number;
  /** GST component of the payable amount (included or added, per settings) */
  tax: number;
  taxInclusive: boolean;
  total: number;
  /** total saved vs MRP, incl. coupon */
  youSave: number;
  amountToFreeShipping: number;
}

export type CouponCheck = { ok: true; discount: number } | { ok: false; reason: string };

export function validateCoupon(coupon: Coupon | undefined | null, merchandise: number, now = Date.now()): CouponCheck {
  if (!coupon) return { ok: false, reason: "That code isn't valid." };
  if (!coupon.active) return { ok: false, reason: "This code is no longer active." };
  if (new Date(coupon.expiresAt).getTime() < now) return { ok: false, reason: "This code has expired." };
  if (merchandise < coupon.minOrder) {
    return { ok: false, reason: `Add items worth ₹${(coupon.minOrder - merchandise).toLocaleString("en-IN")} more to use ${coupon.code}.` };
  }
  let discount = coupon.type === "percent" ? (merchandise * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(Math.round(discount), merchandise);
  return { ok: true, discount };
}

export function computeTotals(
  lines: PricedLine[],
  opts: {
    coupon?: Coupon | null;
    store: StoreSettings["store"];
    paymentMethod?: PaymentMethod;
    now?: number;
  },
): Totals {
  const { store } = opts;
  const subtotal = lines.reduce((s, l) => s + l.mrp * l.quantity, 0);
  const selling = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const productSavings = subtotal - selling;
  const couponCheck = opts.coupon ? validateCoupon(opts.coupon, selling, opts.now) : null;
  const couponDiscount = couponCheck?.ok ? couponCheck.discount : 0;
  const payableMerch = selling - couponDiscount;
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const shipping = itemCount === 0 || payableMerch >= store.freeShippingAbove ? 0 : store.shippingFee;
  const codFee = opts.paymentMethod === "cod" && itemCount > 0 ? store.codFee : 0;
  const taxBase = payableMerch;
  const tax = store.taxInclusive
    ? Math.round((taxBase * store.taxRate) / (100 + store.taxRate))
    : Math.round((taxBase * store.taxRate) / 100);
  const total = payableMerch + shipping + codFee + (store.taxInclusive ? 0 : tax);
  return {
    itemCount,
    subtotal,
    productSavings,
    couponDiscount,
    discount: productSavings + couponDiscount,
    shipping,
    codFee,
    tax,
    taxInclusive: store.taxInclusive,
    total,
    youSave: productSavings + couponDiscount,
    amountToFreeShipping: Math.max(0, store.freeShippingAbove - payableMerch),
  };
}
