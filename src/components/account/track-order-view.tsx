"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SearchX } from "lucide-react";
import { OrderDetail } from "@/components/account/order-detail";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useOrderStore } from "@/store/orders";
import type { Order } from "@/types";

const schema = z.object({
  orderId: z.string().trim().min(6, "Enter your order number, like AAD-261003-1496"),
  contact: z.string().trim().min(5, "Enter the mobile number or email used for the order"),
});
type Values = z.infer<typeof schema>;

const digits = (s: string) => s.replace(/\D/g, "").slice(-10);

export function TrackOrderView() {
  const orders = useOrderStore((s) => s.orders);
  const [result, setResult] = useState<Order | null | undefined>(undefined);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { orderId: "", contact: "" } });

  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Track order" }]} className="mb-8" />
      {result ? (
        <OrderDetail order={result} backHref="/track-order" readOnly />
      ) : (
        <div className="mx-auto max-w-xl">
          <p className="eyebrow mb-4 text-clay">Customer service</p>
          <h1 className="display-lg">
            Track your <em className="font-serif italic">order.</em>
          </h1>
          <p className="mt-5 text-[1rem] leading-relaxed text-graphite">No account needed. Enter your order number and the mobile number or email you used at checkout.</p>

          <form
            noValidate
            className="mt-10 space-y-5"
            onSubmit={handleSubmit(async (v) => {
              await new Promise((r) => setTimeout(r, 500));
              const id = v.orderId.trim().toUpperCase();
              const contact = v.contact.trim().toLowerCase();
              const order = orders.find((o) => o.id.toUpperCase() === id && (o.customer.email.toLowerCase() === contact || (digits(contact).length === 10 && digits(o.customer.phone) === digits(contact))));
              setResult(order ?? null);
            })}
          >
            <Field label="Order number" error={errors.orderId} required>
              {(p) => <Input placeholder="AAD-261003-1496" autoCapitalize="characters" className="uppercase placeholder:normal-case" {...p} {...register("orderId")} />}
            </Field>
            <Field label="Mobile number or email" error={errors.contact} required>
              {(p) => <Input placeholder="98450 12873 or you@example.com" {...p} {...register("contact")} />}
            </Field>
            {result === null && (
              <div role="alert" className="flex items-start gap-3 border border-danger/40 bg-danger/[0.07] p-4 text-[0.875rem] text-danger">
                <SearchX className="mt-0.5 size-4 shrink-0" />
                <p>We couldn't find an order matching those details. Check the order number and contact, then try again.</p>
              </div>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Looking up…" : "Track order"}
            </Button>
            <p className="text-[0.8125rem] text-stone">Demo: try order <span className="font-mono">AAD-261003-1496</span> with mobile <span className="font-mono">98450 12873</span>.</p>
          </form>
        </div>
      )}
    </div>
  );
}
