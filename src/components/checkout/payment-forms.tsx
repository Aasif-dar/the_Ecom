"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type OnlineMethod = "upi" | "card" | "netbanking";

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Yes Bank", "Punjab National Bank", "Bank of Baroda"];

const upiSchema = z.object({ upi: z.string().trim().regex(/^[\w.\-]{2,}@[a-zA-Z]{2,}$/, "Enter a valid UPI ID, like name@okhdfc") });
const cardSchema = z.object({
  name: z.string().trim().min(2, "Enter the name on the card"),
  number: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => /^\d{16}$/.test(v), "Enter a valid 16-digit card number"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/, "Use MM/YY").refine((v) => {
    const [m, y] = v.split("/").map((s) => Number(s.trim()));
    const exp = new Date(2000 + y, m, 0, 23, 59);
    return exp.getTime() > Date.now();
  }, "This card has expired"),
  cvv: z.string().regex(/^\d{3,4}$/, "Enter the 3-digit CVV"),
});
const bankSchema = z.object({ bank: z.string().min(1, "Choose your bank") });

export interface PaymentFormHandle {
  /** validates the active form; resolves instrument label on success, null on validation errors */
  submit: () => Promise<string | null>;
}

const TABS: { id: OnlineMethod; label: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net banking", icon: Landmark },
];

export const OnlinePaymentForm = forwardRef<PaymentFormHandle>(function OnlinePaymentForm(_props, ref) {
  const [method, setMethod] = useState<OnlineMethod>("upi");
  const upi = useForm<z.input<typeof upiSchema>>({ resolver: zodResolver(upiSchema), defaultValues: { upi: "" } });
  const card = useForm<z.input<typeof cardSchema>, unknown, z.output<typeof cardSchema>>({ resolver: zodResolver(cardSchema), defaultValues: { name: "", number: "", expiry: "", cvv: "" } });
  const bank = useForm<z.input<typeof bankSchema>>({ resolver: zodResolver(bankSchema), defaultValues: { bank: "" } });

  useImperativeHandle(ref, () => ({
    submit: () =>
      new Promise<string | null>((resolve) => {
        if (method === "upi") upi.handleSubmit((v) => resolve(`UPI · ${v.upi}`), () => resolve(null))();
        else if (method === "card") card.handleSubmit((v) => resolve(`Card •••• ${v.number.slice(-4)}`), () => resolve(null))();
        else bank.handleSubmit((v) => resolve(`${v.bank} NetBanking`), () => resolve(null))();
      }),
  }));

  return (
    <div>
      <div role="tablist" aria-label="Online payment method" className="grid grid-cols-3 border border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={method === t.id}
            onClick={() => setMethod(t.id)}
            className={cn("flex items-center justify-center gap-2 py-3.5 text-[0.78rem] font-medium transition-colors [&+&]:border-l [&+&]:border-line", method === t.id ? "bg-ink text-paper" : "bg-paper-2 hover:bg-bone")}
          >
            <t.icon className="size-4" strokeWidth={1.5} /> {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-6">
        {method === "upi" && (
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <Field label="UPI ID" error={upi.formState.errors.upi} hint="Open your UPI app to approve the request after you place the order.">
              {(p) => <Input placeholder="yourname@okhdfc" autoComplete="off" {...p} {...upi.register("upi")} />}
            </Field>
          </form>
        )}
        {method === "card" && (
          <form noValidate onSubmit={(e) => e.preventDefault()} className="grid gap-5 sm:grid-cols-2">
            <Field label="Card number" error={card.formState.errors.number} className="sm:col-span-2">
              {(p) => (
                <Controller
                  control={card.control}
                  name="number"
                  render={({ field }) => (
                    <Input
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      {...p}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                    />
                  )}
                />
              )}
            </Field>
            <Field label="Name on card" error={card.formState.errors.name} className="sm:col-span-2">
              {(p) => <Input autoComplete="cc-name" {...p} {...card.register("name")} />}
            </Field>
            <Field label="Expiry" error={card.formState.errors.expiry}>
              {(p) => (
                <Controller
                  control={card.control}
                  name="expiry"
                  render={({ field }) => (
                    <Input
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      maxLength={5}
                      {...p}
                      value={field.value}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                        field.onChange(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                      }}
                    />
                  )}
                />
              )}
            </Field>
            <Field label="CVV" error={card.formState.errors.cvv}>
              {(p) => <Input type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} placeholder="•••" {...p} {...card.register("cvv")} />}
            </Field>
          </form>
        )}
        {method === "netbanking" && (
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <Field label="Select your bank" error={bank.formState.errors.bank}>
              {(p) => (
                <Controller
                  control={bank.control}
                  name="bank"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} items={BANKS.map((b) => ({ value: b, label: b }))}>
                      <SelectTrigger id={p.id} aria-invalid={p["aria-invalid"]} className="w-full">
                        <SelectValue placeholder="Choose a bank" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        {BANKS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </Field>
          </form>
        )}
      </div>
      <p className="mt-5 text-[0.78rem] leading-relaxed text-stone">Demo checkout: no real payment is taken. Use any valid-looking details, e.g. UPI <span className="font-mono">demo@okhdfc</span> or card 4242 4242 4242 4242.</p>
    </div>
  );
});
