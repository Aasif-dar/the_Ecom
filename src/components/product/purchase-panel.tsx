"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { WishlistButton } from "@/components/product/wishlist-button";
import { SizeGuideDialog } from "@/components/product/size-guide";
import { colorHasStock, LOW_STOCK_THRESHOLD, sizeAvailability, totalStock, variantStock } from "@/lib/product-utils";
import { useCartStore } from "@/store/cart";
import { useUiStore } from "@/store/ui";

export function PurchasePanel({ product, compact = false, onAdded }: { product: Product; compact?: boolean; onAdded?: () => void }) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const pulseCart = useUiStore((s) => s.pulseCart);

  const firstInStock = product.colors.find((c) => colorHasStock(product, c.name))?.name ?? product.colors[0]?.name ?? "";
  const [color, setColor] = useState(firstInStock);
  const [size, setSize] = useState<string>(product.sizes.length === 1 ? product.sizes[0] : "");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [shake, setShake] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  // If admin changes stock/variants while the page is open, keep the selection valid.
  useEffect(() => {
    if (!product.colors.some((c) => c.name === color)) setColor(firstInStock);
  }, [product.colors, color, firstInStock]);

  const availability = useMemo(() => sizeAvailability(product, color), [product, color]);
  const stock = size ? variantStock(product, color, size) : 0;
  const soldOutEverywhere = totalStock(product) <= 0;
  const colorName = product.colors.find((c) => c.name === color)?.name ?? color;

  useEffect(() => {
    // switching colour may remove the chosen size
    if (size && (availability[size] ?? 0) <= 0) setSize("");
  }, [availability, size]);

  useEffect(() => {
    if (qty > Math.max(1, stock)) setQty(Math.max(1, Math.min(stock, 10)));
  }, [stock, qty]);

  const validate = () => {
    if (!size) {
      setSizeError(true);
      setShake((n) => n + 1);
      return false;
    }
    return true;
  };

  const addToBag = (): boolean => {
    if (!validate()) return false;
    const res = add({ productId: product.id, color, size, quantity: qty });
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    pulseCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast.success(res.capped ? `Only ${res.quantity} available. Bag updated.` : "Added to your bag", { description: `${product.name} · ${colorName}${size !== "One Size" ? ` · ${size}` : ""}` });
    onAdded?.();
    return true;
  };

  const handleAdd = () => {
    if (addToBag()) setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (addToBag()) {
      setCartOpen(false);
      router.push("/checkout");
    }
  };

  if (soldOutEverywhere) return <NotifyMe productName={product.name} />;

  return (
    <div className="flex flex-col gap-7">
      {product.colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 flex items-baseline gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">
            Colour <span className="font-normal normal-case tracking-normal text-stone">{colorName}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colour">
            {product.colors.map((c) => {
              const available = colorHasStock(product, c.name);
              const selected = c.name === color;
              return (
                <button
                  key={c.name}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${c.name}${available ? "" : " (sold out)"}`}
                  title={c.name}
                  onClick={() => setColor(c.name)}
                  className={cn(
                    "relative grid size-9 place-items-center rounded-full border transition-all",
                    selected ? "border-ink" : "border-transparent hover:border-stone/50",
                  )}
                >
                  <span className="size-6 rounded-full border border-ink/15" style={{ background: c.hex }} />
                  {!available && <span aria-hidden className="absolute h-px w-8 -rotate-45 bg-ink/60" />}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {!(product.sizes.length === 1 && product.sizes[0] === "One Size") && (
        <fieldset key={shake} className={cn(shake > 0 && sizeError && "animate-[shake_0.45s_ease]")}>
          <legend className="mb-3 flex w-full items-center justify-between text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">
            <span>
              Size {size && <span className="font-normal normal-case tracking-normal text-stone">{size}</span>}
            </span>
            <SizeGuideDialog kind={product.sizeGuide} />
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {product.sizes.map((s) => {
              const left = availability[s] ?? 0;
              const out = left <= 0;
              const selected = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={out}
                  disabled={out}
                  aria-label={`Size ${s}${out ? ", sold out" : ""}`}
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={cn(
                    "relative h-11 min-w-12 border px-3.5 text-[0.8125rem] font-medium tabular-nums transition-colors",
                    selected ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 text-ink hover:border-ink",
                    out && "cursor-not-allowed border-line bg-transparent text-stone/60 hover:border-line",
                  )}
                >
                  {s}
                  {out && <span aria-hidden className="absolute inset-x-1 top-1/2 h-px -rotate-[22deg] bg-stone/50" />}
                </button>
              );
            })}
          </div>
          {sizeError && (
            <p role="alert" className="mt-2.5 text-[0.8125rem] text-danger">
              Please choose a size to continue.
            </p>
          )}
          {size && stock > 0 && stock <= LOW_STOCK_THRESHOLD && (
            <p className="mt-2.5 text-[0.8125rem] font-medium text-clay">Only {stock} left in this size</p>
          )}
        </fieldset>
      )}

      <div className={cn("flex flex-col gap-3", !compact && "sm:flex-row")}>
        <div className="flex gap-3">
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(stock || 10, 10))} />
          {compact && <WishlistButton productId={product.id} productName={product.name} variant="outline" />}
        </div>
        <Button size="lg" className="flex-1" onClick={handleAdd} aria-live="polite">
          {justAdded ? (
            <>
              <Check className="size-4" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" /> Add to bag
            </>
          )}
        </Button>
        {!compact && <WishlistButton productId={product.id} productName={product.name} variant="outline" className="hidden sm:grid" />}
      </div>
      {!compact && (
        <div className="flex gap-3">
          <Button size="lg" variant="outline" className="flex-1" onClick={handleBuyNow}>
            Buy now
          </Button>
          <WishlistButton productId={product.id} productName={product.name} variant="outline" className="sm:hidden" />
        </div>
      )}
    </div>
  );
}

function NotifyMe({ productName }: { productName: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col gap-4 border border-line bg-bone p-5">
      <div className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
        <Bell className="size-3.5" /> Currently sold out
      </div>
      {done ? (
        <p className="text-sm text-graphite">Thank you. We'll email {email} as soon as {productName} is back.</p>
      ) : (
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email address.");
            setDone(true);
            toast.success("We'll let you know when it's back");
          }}
        >
          <Input type="email" placeholder="Your email address" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="sm:shrink-0">
            Notify me
          </Button>
        </form>
      )}
    </div>
  );
}
