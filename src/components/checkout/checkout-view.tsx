"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Banknote, CalendarClock, CircleAlert, CreditCard, Loader2, Lock, MapPin, Plus, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AddressCard } from "@/components/account/address-card";
import { AddressFormDialog } from "@/components/account/address-form";
import { OrderSummary } from "@/components/cart/order-summary";
import { CheckoutStepper } from "@/components/checkout/stepper";
import { OnlinePaymentForm, type PaymentFormHandle } from "@/components/checkout/payment-forms";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, formatWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useOrderStore } from "@/store/orders";
import { useSiteStore } from "@/store/site";
import { useCartDetailed, useCurrentUser } from "@/store/hooks";
import { useHydrated } from "@/store/persist";
import type { PaymentMethod } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

function CheckoutSkeleton() {
  return (
    <div className="container-x py-10" aria-busy aria-label="Loading checkout">
      <Skeleton className="mb-10 h-8 w-80" />
      <div className="grid gap-12 lg:grid-cols-[1fr_26rem]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
        <Skeleton className="h-[28rem] w-full" />
      </div>
    </div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const codEnabled = useSiteStore((s) => s.settings.store.codEnabled);
  const codFee = useSiteStore((s) => s.settings.store.codFee);
  const couponCode = useCartStore((s) => s.couponCode);
  const placeOrder = useOrderStore((s) => s.placeOrder);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("online");
  const [addressOpen, setAddressOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [simulateFail, setSimulateFail] = useState(false);
  const formRef = useRef<PaymentFormHandle>(null);
  const placed = useRef(false);

  const { lines, totals, hasUnavailable } = useCartDetailed(method);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login?next=/checkout");
  }, [hydrated, user, router]);

  const address = useMemo(() => user?.addresses.find((a) => a.id === addressId), [user, addressId]);
  useEffect(() => {
    if (user && !addressId && user.addresses.length) setAddressId((user.addresses.find((a) => a.isDefault) ?? user.addresses[0]).id);
  }, [user, addressId]);

  if (!hydrated || !user) return <CheckoutSkeleton />;

  // Empty bag (but not mid-placement, when the cart is cleared before we navigate)
  if (lines.length === 0 && !placed.current) {
    return (
      <div className="container-x">
        <EmptyState
          icon={ShoppingBag}
          title="There's nothing to check out"
          body="Your bag is empty. Add something you love and come back."
          actions={
            <Link href="/shop" className={buttonVariants({ size: "lg" })}>
              Continue shopping
            </Link>
          }
        />
      </div>
    );
  }

  const eta = formatWeekday(Date.now() + (["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "Haryana"].includes(address?.state ?? "") ? 4 : 6) * DAY);

  const place = async () => {
    if (!address) return setStep(1);
    if (hasUnavailable) return toast.error("Some items are no longer available. Please review your bag.");
    setPayError(null);
    let instrument: string | undefined;
    if (method === "online") {
      const label = await formRef.current?.submit();
      if (!label) return; // field errors are shown inline
      instrument = label;
    }
    setPaying(true);
    await new Promise((r) => setTimeout(r, method === "online" ? 2200 : 900));
    if (method === "online" && simulateFail) {
      setPaying(false);
      setPayError("Your bank declined the transaction. No money has been deducted. Please try again or use a different payment method.");
      return;
    }
    placed.current = true;
    const order = placeOrder({
      user,
      address,
      lines: lines.map((l) => ({ product: l.product, color: l.item.color, size: l.item.size, quantity: l.item.quantity })),
      paymentMethod: method,
      couponCode,
      payment: { instrument },
    });
    router.replace(`/order-confirmation/${order.id}`);
  };

  return (
    <div className="container-x pb-4 pt-8 sm:pt-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Bag", href: "/cart" }, { label: "Checkout" }]} className="mb-6" />
      <div className="mb-10 flex flex-wrap items-center justify-between gap-5 sm:mb-12">
        <h1 className="display-md">Checkout</h1>
        <CheckoutStepper step={step} />
      </div>

      {hasUnavailable && (
        <div role="alert" className="mb-8 flex items-start gap-3 border border-danger/40 bg-danger/[0.07] p-4 text-[0.875rem] text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Some items in your bag have gone out of stock.{" "}
            <Link href="/cart" className="font-medium underline underline-offset-4">
              Review your bag
            </Link>{" "}
            before placing the order.
          </p>
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[1fr_26rem] lg:gap-16 xl:grid-cols-[1fr_28rem]">
        <div className="min-w-0">
          {/* STEP 1 — ADDRESS */}
          {step === 1 && (
            <section aria-labelledby="co-addr">
              <h2 id="co-addr" className="mb-2 font-serif text-[2rem] leading-none">
                Delivery address
              </h2>
              <p className="mb-7 text-[0.9rem] text-stone">Choose where we should deliver your order.</p>
              {user.addresses.length === 0 ? (
                <div className="border border-dashed border-line p-10 text-center">
                  <MapPin className="mx-auto mb-3 size-8 text-stone" strokeWidth={1} />
                  <p className="font-serif text-[1.5rem]">Add your first address</p>
                  <p className="mx-auto mt-2 max-w-sm text-[0.875rem] text-stone">We'll save it for next time too.</p>
                  <Button size="lg" className="mt-6" onClick={() => setAddressOpen(true)}>
                    <Plus className="size-4" /> Add address
                  </Button>
                </div>
              ) : (
                <>
                  <div role="radiogroup" aria-label="Saved addresses" className="grid gap-4 md:grid-cols-2">
                    {user.addresses.map((a) => (
                      <AddressCard key={a.id} address={a} selectable selected={a.id === addressId} onSelect={() => setAddressId(a.id)} />
                    ))}
                    <button type="button" onClick={() => setAddressOpen(true)} className="flex min-h-40 flex-col items-center justify-center gap-2 border border-dashed border-stone/50 text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-graphite transition-colors hover:border-ink hover:text-ink">
                      <Plus className="size-5" strokeWidth={1.4} /> Add new address
                    </button>
                  </div>
                  <Button size="lg" className="mt-9" disabled={!address} onClick={() => setStep(2)}>
                    Deliver here <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
            </section>
          )}

          {/* STEP 2 — REVIEW */}
          {step === 2 && address && (
            <section aria-labelledby="co-review">
              <h2 id="co-review" className="mb-7 font-serif text-[2rem] leading-none">
                Review your order
              </h2>
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border border-line bg-paper-2 p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="mb-2 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone">
                    <MapPin className="size-3.5" /> Delivering to
                  </p>
                  <p className="text-[0.9375rem] font-medium">{address.fullName}</p>
                  <p className="mt-1 text-[0.875rem] leading-relaxed text-graphite">
                    {address.line1}, {address.line2}, {address.city}, {address.state} {address.pincode}
                  </p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-[0.75rem] font-medium uppercase tracking-[0.14em] underline underline-offset-4 hover:text-clay">
                  Change
                </button>
              </div>
              <p className="mb-6 flex items-center gap-2.5 bg-bone px-4 py-3 text-[0.875rem]">
                <CalendarClock className="size-4" /> Estimated delivery <strong className="font-medium">{eta}</strong>
              </p>
              <ul className="divide-y divide-line border-y border-line">
                {lines.map(({ item, product, unitPrice, unitMrp }) => (
                  <li key={item.id} className="flex gap-4 py-5">
                    <div className="relative h-[100px] w-[80px] shrink-0 overflow-hidden bg-bone">
                      <Image src={product.images[0]} alt={product.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[0.9375rem]">{product.name}</p>
                      <p className="mt-1 text-[0.8125rem] text-stone">
                        {item.color}
                        {item.size !== "One Size" && ` · Size ${item.size}`} · Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.9375rem] font-medium tabular-nums">{formatINR(unitPrice * item.quantity)}</p>
                      {unitMrp > unitPrice && <p className="text-[0.78rem] tabular-nums text-stone line-through">{formatINR(unitMrp * item.quantity)}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button size="lg" disabled={hasUnavailable} onClick={() => setStep(3)}>
                  Continue to payment <ArrowRight className="size-4" />
                </Button>
              </div>
            </section>
          )}

          {/* STEP 3 — PAYMENT */}
          {step === 3 && address && (
            <section aria-labelledby="co-pay">
              <h2 id="co-pay" className="mb-2 font-serif text-[2rem] leading-none">
                Payment
              </h2>
              <p className="mb-7 flex items-center gap-2 text-[0.9rem] text-stone">
                <Lock className="size-3.5" /> Secure, encrypted checkout
              </p>

              <div role="radiogroup" aria-label="Payment method" className="grid gap-3">
                {[
                  { id: "online" as const, title: "Online payment", sub: "UPI, credit / debit card, net banking", icon: CreditCard, disabled: false },
                  { id: "cod" as const, title: "Cash on delivery", sub: `Pay when it arrives. ${formatINR(codFee)} handling fee`, icon: Banknote, disabled: !codEnabled },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={method === o.id}
                    disabled={o.disabled}
                    onClick={() => {
                      setMethod(o.id);
                      setPayError(null);
                    }}
                    className={cn(
                      "flex items-center gap-4 border p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      method === o.id ? "border-ink bg-paper-2 ring-1 ring-ink" : "border-line bg-paper-2 hover:border-ink",
                    )}
                  >
                    <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", method === o.id ? "border-ink" : "border-stone/60")}>
                      {method === o.id && <span className="size-2.5 rounded-full bg-ink" />}
                    </span>
                    <o.icon className="size-6 shrink-0" strokeWidth={1.2} />
                    <span>
                      <span className="block text-[0.95rem] font-medium">{o.title}</span>
                      <span className="block text-[0.8125rem] text-stone">{o.disabled ? "Currently unavailable" : o.sub}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 border border-line bg-paper-2 p-5 sm:p-7">
                {method === "online" ? (
                  <OnlinePaymentForm ref={formRef} />
                ) : (
                  <div className="flex items-start gap-3 text-[0.9rem] leading-relaxed text-graphite">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0" strokeWidth={1.3} />
                    <p>
                      Pay <strong className="font-medium text-ink">{formatINR(totals.total)}</strong> in cash or via UPI to the delivery partner when your order arrives. Please keep the exact amount handy.
                    </p>
                  </div>
                )}
              </div>

              {method === "online" && (
                <label className="mt-4 flex w-fit cursor-pointer items-center gap-3 text-[0.8125rem] text-stone">
                  <input type="checkbox" checked={simulateFail} onChange={(e) => setSimulateFail(e.target.checked)} className="size-4 accent-[var(--ink)]" />
                  Demo: simulate a failed payment
                </label>
              )}

              {payError && (
                <div role="alert" className="mt-6 flex items-start gap-3 border border-danger/40 bg-danger/[0.07] p-4 text-[0.875rem] text-danger">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-medium">Payment failed</p>
                    <p className="mt-1">{payError}</p>
                    <button
                      type="button"
                      className="mt-2 font-medium underline underline-offset-4"
                      onClick={() => {
                        setSimulateFail(false);
                        setPayError(null);
                      }}
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-9 flex flex-wrap gap-3">
                <Button variant="ghost" size="lg" onClick={() => setStep(2)} disabled={paying}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button size="lg" onClick={place} disabled={paying || hasUnavailable} className="min-w-56">
                  {paying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> {method === "online" ? "Authorising payment…" : "Placing order…"}
                    </>
                  ) : method === "online" ? (
                    <>Pay {formatINR(totals.total)}</>
                  ) : (
                    <>Place order · {formatINR(totals.total)}</>
                  )}
                </Button>
              </div>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary totals={totals} couponCode={couponCode} showCoupon={step !== 3} paymentLabel={method === "cod" ? "Payable in cash on delivery" : undefined}>
            <ul className="space-y-3 border-t border-line pt-5">
              {lines.slice(0, 4).map(({ item, product }) => (
                <li key={item.id} className="flex items-center gap-3 text-[0.8125rem]">
                  <div className="relative size-12 shrink-0 overflow-hidden bg-bone">
                    <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <span className="line-clamp-1 flex-1 text-graphite">{product.name}</span>
                  <span className="tabular-nums text-stone">×{item.quantity}</span>
                </li>
              ))}
              {lines.length > 4 && <li className="text-[0.78rem] text-stone">+ {lines.length - 4} more</li>}
            </ul>
          </OrderSummary>
        </div>
      </div>

      <AddressFormDialog
        open={addressOpen}
        onOpenChange={setAddressOpen}
        onSaved={(a) => {
          setAddressId(a.id);
        }}
      />
    </div>
  );
}
