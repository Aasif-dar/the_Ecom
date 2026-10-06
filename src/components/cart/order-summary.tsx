"use client";

import { useState } from "react";
import { Check, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/format";
import { validateCoupon, type Totals } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useSiteStore } from "@/store/site";

export function CouponBox({ merchandise }: { merchandise: number }) {
  const code = useCartStore((s) => s.couponCode);
  const apply = useCartStore((s) => s.applyCoupon);
  const remove = useCartStore((s) => s.removeCoupon);
  const coupons = useSiteStore((s) => s.coupons);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tryApply = (raw: string) => {
    const c = raw.trim().toUpperCase();
    if (!c) return;
    const coupon = coupons.find((x) => x.code === c);
    const check = validateCoupon(coupon, merchandise);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    apply(c);
    setValue("");
    setError(null);
    toast.success(`${c} applied`, { description: `You save ${formatINR(check.discount)}` });
  };

  const available = coupons.filter((c) => c.active && new Date(c.expiresAt).getTime() > Date.now());

  return (
    <div>
      {code ? (
        <div className="flex items-center justify-between border border-success/40 bg-success/[0.07] px-4 py-3">
          <span className="flex items-center gap-2.5 text-[0.875rem]">
            <Check className="size-4 text-success" />
            <strong className="font-mono font-medium tracking-[0.12em]">{code}</strong> applied
          </span>
          <button type="button" onClick={remove} aria-label="Remove coupon" className="text-stone hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              tryApply(value);
            }}
            className="flex gap-2"
          >
            <label htmlFor="coupon" className="sr-only">
              Discount code
            </label>
            <Input id="coupon" value={value} onChange={(e) => { setValue(e.target.value); setError(null); }} placeholder="Discount code" aria-invalid={!!error} aria-describedby={error ? "coupon-err" : undefined} className="uppercase tracking-[0.1em] placeholder:normal-case placeholder:tracking-normal" />
            <Button type="submit" variant="outline" className="shrink-0">
              Apply
            </Button>
          </form>
          {error && (
            <p id="coupon-err" role="alert" className="mt-2 text-[0.8125rem] text-danger">
              {error}
            </p>
          )}
          <details className="group mt-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[0.8125rem] text-graphite underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
              <Tag className="size-3.5" /> View available offers
            </summary>
            <ul className="mt-3 space-y-2">
              {available.map((c) => (
                <li key={c.code} className="flex items-center justify-between gap-3 border border-line bg-paper-2 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[0.8125rem] font-medium tracking-[0.12em]">{c.code}</p>
                    <p className="truncate text-[0.75rem] text-stone">{c.description}</p>
                  </div>
                  <button type="button" onClick={() => tryApply(c.code)} className="shrink-0 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-clay hover:underline">
                    Apply
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}

export function OrderSummary({
  totals,
  couponCode,
  showCoupon = true,
  className,
  title = "Order summary",
  children,
  paymentLabel,
}: {
  totals: Totals;
  couponCode?: string | null;
  showCoupon?: boolean;
  className?: string;
  title?: string;
  children?: React.ReactNode;
  paymentLabel?: string;
}) {
  const row = "flex items-baseline justify-between gap-4 text-[0.9375rem]";
  return (
    <aside aria-label={title} className={cn("bg-paper-2 p-6 sm:p-8", className)}>
      <h2 className="font-serif text-[1.9rem] leading-none">{title}</h2>
      {showCoupon && (
        <div className="mt-6 border-b border-line pb-6">
          <CouponBox merchandise={totals.subtotal - totals.productSavings} />
        </div>
      )}
      <dl className="mt-6 space-y-3.5">
        <div className={row}>
          <dt className="text-graphite">Subtotal ({totals.itemCount} {totals.itemCount === 1 ? "item" : "items"})</dt>
          <dd className="tabular-nums">{formatINR(totals.subtotal)}</dd>
        </div>
        <div className={row}>
          <dt className="text-graphite">Discount</dt>
          <dd className={cn("tabular-nums", totals.discount > 0 && "text-success")}>{totals.discount > 0 ? `− ${formatINR(totals.discount)}` : formatINR(0)}</dd>
        </div>
        {totals.couponDiscount > 0 && couponCode && (
          <div className="-mt-2 flex justify-between pl-3 text-[0.8125rem] text-stone">
            <span>incl. {couponCode}</span>
            <span className="tabular-nums">− {formatINR(totals.couponDiscount)}</span>
          </div>
        )}
        <div className={row}>
          <dt className="text-graphite">Shipping</dt>
          <dd className="tabular-nums">{totals.shipping === 0 ? <span className="text-success">Free</span> : formatINR(totals.shipping)}</dd>
        </div>
        {totals.codFee > 0 && (
          <div className={row}>
            <dt className="text-graphite">Cash on delivery fee</dt>
            <dd className="tabular-nums">{formatINR(totals.codFee)}</dd>
          </div>
        )}
        <div className={row}>
          <dt className="text-graphite">GST {totals.taxInclusive ? "(included)" : ""}</dt>
          <dd className="tabular-nums text-stone">{formatINR(totals.tax)}</dd>
        </div>
      </dl>
      <div className="mt-6 flex items-baseline justify-between border-t border-ink pt-5">
        <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em]">Total</span>
        <span className="font-serif text-[2.2rem] leading-none tabular-nums">{formatINR(totals.total)}</span>
      </div>
      {paymentLabel && <p className="mt-2 text-right text-[0.78rem] text-stone">{paymentLabel}</p>}
      {totals.youSave > 0 && (
        <p className="mt-4 bg-success/[0.08] px-3.5 py-2.5 text-center text-[0.8125rem] font-medium text-success">You're saving {formatINR(totals.youSave)} on this order</p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </aside>
  );
}
