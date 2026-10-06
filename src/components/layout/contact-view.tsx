"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BRAND } from "@/lib/brand";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().min(1, "Enter your email address").email("That doesn't look like a valid email"),
  subject: z.string().trim().min(3, "Add a subject"),
  message: z.string().trim().min(15, "Tell us a little more (at least 15 characters)").max(1500),
});
type Values = z.infer<typeof schema>;

export function ContactView() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} className="mb-8" />
      <div className="grid gap-14 lg:grid-cols-[1fr_26rem] lg:gap-24">
        <div>
          <p className="eyebrow mb-4 text-clay">Customer service</p>
          <h1 className="display-lg">
            We're here, <em className="font-serif italic">truly.</em>
          </h1>
          <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-graphite">Questions about an order, a fit or a fabric? Write to us and a real person will reply within one working day.</p>

          {sent ? (
            <div role="status" className="mt-12 border border-line bg-paper-2 p-8">
              <MessageCircle className="mb-4 size-8" strokeWidth={1} />
              <p className="font-serif text-[2rem] leading-none">Message received</p>
              <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-graphite">Thank you. We'll reply to your email within one working day. In this demo no message is actually sent.</p>
              <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form
              noValidate
              className="mt-12 grid gap-6 sm:grid-cols-2"
              onSubmit={handleSubmit(async () => {
                await new Promise((r) => setTimeout(r, 700));
                toast.success("Message sent");
                reset();
                setSent(true);
              })}
            >
              <Field label="Name" error={errors.name} required>
                {(p) => <Input autoComplete="name" {...p} {...register("name")} />}
              </Field>
              <Field label="Email" error={errors.email} required>
                {(p) => <Input type="email" autoComplete="email" {...p} {...register("email")} />}
              </Field>
              <Field label="Subject" error={errors.subject} required className="sm:col-span-2">
                {(p) => <Input placeholder="e.g. Where is my order?" {...p} {...register("subject")} />}
              </Field>
              <Field label="Message" error={errors.message} required className="sm:col-span-2">
                {(p) => <Textarea rows={6} {...p} {...register("message")} />}
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Sending…" : "Send message"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-8 lg:pt-24">
          {[
            { icon: Mail, title: "Email", body: BRAND.email, href: `mailto:${BRAND.email}` },
            { icon: Phone, title: "Phone", body: BRAND.phone, href: `tel:${BRAND.phone.replace(/\s/g, "")}` },
            { icon: Clock, title: "Hours", body: "Mon – Sat, 10 am – 7 pm IST" },
            { icon: MapPin, title: "Studio", body: BRAND.address },
          ].map((x) => (
            <div key={x.title} className="flex gap-5 border-t border-line pt-6">
              <x.icon className="mt-1 size-5 shrink-0" strokeWidth={1.3} />
              <div>
                <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-stone">{x.title}</p>
                {x.href ? (
                  <a href={x.href} className="mt-1 block text-[1.0625rem] underline-offset-4 hover:underline">
                    {x.body}
                  </a>
                ) : (
                  <p className="mt-1 text-[1.0625rem]">{x.body}</p>
                )}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
