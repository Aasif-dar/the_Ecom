"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSiteStore } from "@/store/site";

const url = (label: string) => z.string().trim().refine((v) => !v || /^https?:\/\/.+\..+/.test(v), `Enter a full ${label} URL starting with https://`);

const general = z.object({
  storeName: z.string().trim().min(2, "Enter your store name").max(40),
  logoText: z.string().trim().min(2, "Enter the wordmark").max(16, "Keep the wordmark under 16 characters"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(6, "Enter a phone number"),
  address: z.string().trim().min(8, "Enter the studio address"),
});
const store = z.object({
  taxRate: z.number({ invalid_type_error: "Enter a tax rate" }).min(0, "Tax can't be negative").max(28, "Maximum 28%"),
  taxInclusive: z.boolean(),
  shippingFee: z.number({ invalid_type_error: "Enter a fee" }).min(0).max(2000),
  freeShippingAbove: z.number({ invalid_type_error: "Enter an amount" }).min(0).max(100000),
  codEnabled: z.boolean(),
  codFee: z.number({ invalid_type_error: "Enter a fee" }).min(0).max(500),
});
const social = z.object({ instagram: url("Instagram"), facebook: url("Facebook"), linkedin: url("LinkedIn") });
const seo = z.object({
  metaTitle: z.string().trim().min(10, "Use at least 10 characters").max(70, "Keep it under 70 characters"),
  metaDescription: z.string().trim().min(40, "Use at least 40 characters").max(170, "Keep it under 170 characters"),
});

function SaveBar({ dirty, busy, onReset }: { dirty: boolean; busy: boolean; onReset: () => void }) {
  return (
    <div className="flex items-center gap-3 border-t border-line pt-6">
      <Button type="submit" disabled={!dirty || busy}>
        {busy ? "Saving…" : "Save changes"}
      </Button>
      <Button type="button" variant="ghost" disabled={!dirty} onClick={onReset}>
        Discard
      </Button>
    </div>
  );
}

function GeneralTab() {
  const g = useSiteStore((s) => s.settings.general);
  const update = useSiteStore((s) => s.updateSettings);
  const f = useForm<z.infer<typeof general>>({ resolver: zodResolver(general), defaultValues: g });
  useEffect(() => f.reset(g), [g, f]);
  const { errors, isDirty, isSubmitting } = f.formState;
  return (
    <AdminCard className="max-w-3xl p-5 sm:p-8">
      <form noValidate className="space-y-6" onSubmit={f.handleSubmit(async (v) => { await new Promise((r) => setTimeout(r, 300)); update("general", v); toast.success("General settings saved"); })}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Store name" error={errors.storeName} required>{(p) => <Input {...p} {...f.register("storeName")} />}</Field>
          <Field label="Logo wordmark" error={errors.logoText} required hint="Shown in the header and footer.">{(p) => <Input className="uppercase tracking-widest" {...p} {...f.register("logoText")} />}</Field>
          <Field label="Contact email" error={errors.email} required>{(p) => <Input type="email" {...p} {...f.register("email")} />}</Field>
          <Field label="Phone" error={errors.phone} required>{(p) => <Input type="tel" {...p} {...f.register("phone")} />}</Field>
        </div>
        <Field label="Address" error={errors.address} required>{(p) => <Textarea rows={2} {...p} {...f.register("address")} />}</Field>
        <SaveBar dirty={isDirty} busy={isSubmitting} onReset={() => f.reset(g)} />
      </form>
    </AdminCard>
  );
}

function StoreTab() {
  const st = useSiteStore((s) => s.settings.store);
  const update = useSiteStore((s) => s.updateSettings);
  const f = useForm<z.infer<typeof store>>({ resolver: zodResolver(store), defaultValues: st });
  useEffect(() => f.reset(st), [st, f]);
  const { errors, isDirty, isSubmitting } = f.formState;
  return (
    <AdminCard className="max-w-3xl p-5 sm:p-8">
      <form noValidate className="space-y-7" onSubmit={f.handleSubmit(async (v) => { await new Promise((r) => setTimeout(r, 300)); update("store", { ...v, currency: "INR" }); toast.success("Store settings saved", { description: "Cart and checkout totals use them straight away." }); })}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Currency" hint="Prices are shown in Indian rupees.">{() => <Input value="INR (₹)" readOnly disabled />}</Field>
          <Field label="GST rate (%)" error={errors.taxRate} required>{(p) => <Input type="number" step="0.5" min={0} max={28} {...p} {...f.register("taxRate", { valueAsNumber: true })} />}</Field>
        </div>
        <div className="flex items-center justify-between gap-4 border-y border-line py-5">
          <div><p id="tax-inc" className="text-[0.9rem] font-medium">Prices include GST</p><p className="text-[0.78rem] text-stone">When off, tax is added on top at checkout.</p></div>
          <Controller control={f.control} name="taxInclusive" render={({ field }) => <Switch aria-labelledby="tax-inc" checked={field.value} onCheckedChange={field.onChange} />} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Shipping fee (₹)" error={errors.shippingFee} required>{(p) => <Input type="number" min={0} {...p} {...f.register("shippingFee", { valueAsNumber: true })} />}</Field>
          <Field label="Free shipping above (₹)" error={errors.freeShippingAbove} required>{(p) => <Input type="number" min={0} {...p} {...f.register("freeShippingAbove", { valueAsNumber: true })} />}</Field>
        </div>
        <div className="flex items-center justify-between gap-4 border-y border-line py-5">
          <div><p id="cod-on" className="text-[0.9rem] font-medium">Cash on delivery</p><p className="text-[0.78rem] text-stone">Offer COD as a payment option at checkout.</p></div>
          <Controller control={f.control} name="codEnabled" render={({ field }) => <Switch aria-labelledby="cod-on" checked={field.value} onCheckedChange={field.onChange} />} />
        </div>
        <Field label="COD handling fee (₹)" error={errors.codFee} required>{(p) => <Input type="number" min={0} className="max-w-48" {...p} {...f.register("codFee", { valueAsNumber: true })} />}</Field>
        <SaveBar dirty={isDirty} busy={isSubmitting} onReset={() => f.reset(st)} />
      </form>
    </AdminCard>
  );
}

function SocialTab() {
  const so = useSiteStore((s) => s.settings.social);
  const update = useSiteStore((s) => s.updateSettings);
  const f = useForm<z.infer<typeof social>>({ resolver: zodResolver(social), defaultValues: so });
  useEffect(() => f.reset(so), [so, f]);
  const { errors, isDirty, isSubmitting } = f.formState;
  return (
    <AdminCard className="max-w-3xl p-5 sm:p-8">
      <form noValidate className="space-y-6" onSubmit={f.handleSubmit(async (v) => { await new Promise((r) => setTimeout(r, 300)); update("social", v); toast.success("Social links saved"); })}>
        <Field label="Instagram" error={errors.instagram}>{(p) => <Input placeholder="https://instagram.com/yourbrand" {...p} {...f.register("instagram")} />}</Field>
        <Field label="Facebook" error={errors.facebook}>{(p) => <Input placeholder="https://facebook.com/yourbrand" {...p} {...f.register("facebook")} />}</Field>
        <Field label="LinkedIn" error={errors.linkedin}>{(p) => <Input placeholder="https://linkedin.com/company/yourbrand" {...p} {...f.register("linkedin")} />}</Field>
        <SaveBar dirty={isDirty} busy={isSubmitting} onReset={() => f.reset(so)} />
      </form>
    </AdminCard>
  );
}

function SeoTab() {
  const seoS = useSiteStore((s) => s.settings.seo);
  const update = useSiteStore((s) => s.updateSettings);
  const f = useForm<z.infer<typeof seo>>({ resolver: zodResolver(seo), defaultValues: seoS });
  useEffect(() => f.reset(seoS), [seoS, f]);
  const { errors, isDirty, isSubmitting } = f.formState;
  const title = f.watch("metaTitle") ?? "";
  const desc = f.watch("metaDescription") ?? "";
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
      <AdminCard className="p-5 sm:p-8">
        <form noValidate className="space-y-6" onSubmit={f.handleSubmit(async (v) => { await new Promise((r) => setTimeout(r, 300)); update("seo", v); toast.success("SEO settings saved"); })}>
          <Field label="Meta title" error={errors.metaTitle} required hint={`${title.length}/70 characters`}>{(p) => <Input {...p} {...f.register("metaTitle")} />}</Field>
          <Field label="Meta description" error={errors.metaDescription} required hint={`${desc.length}/170 characters`}>{(p) => <Textarea rows={4} {...p} {...f.register("metaDescription")} />}</Field>
          <SaveBar dirty={isDirty} busy={isSubmitting} onReset={() => f.reset(seoS)} />
        </form>
      </AdminCard>
      <AdminCard className="self-start p-5 sm:p-6">
        <p className="mb-4 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-stone">Search preview</p>
        <p className="text-[0.75rem] text-success">aadyam.in</p>
        <p className="mt-1 text-[1.1rem] leading-snug text-[#1a0dab]">{title || "Meta title"}</p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-graphite">{desc || "Meta description"}</p>
      </AdminCard>
    </div>
  );
}

function HomepageTab() {
  const sections = useSiteStore((s) => s.content.sections);
  const toggle = useSiteStore((s) => s.toggleSection);
  return (
    <div className="grid max-w-4xl gap-6 md:grid-cols-[1fr_20rem]">
      <AdminCard>
        <p className="border-b border-line px-5 py-4 text-[0.85rem] text-stone sm:px-6">Choose which sections appear on the homepage.</p>
        <ul>
          {sections.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 border-b border-line/70 px-5 py-3.5 last:border-0 sm:px-6">
              <span className="text-[0.9rem]">{s.label}</span>
              <Switch checked={s.enabled} onCheckedChange={(c) => toggle(s.id, c)} aria-label={`Show ${s.label}`} />
            </li>
          ))}
        </ul>
      </AdminCard>
      <AdminCard className="self-start space-y-3 p-5 sm:p-6">
        <p className="font-serif text-[1.35rem] leading-none">Edit content</p>
        <p className="text-[0.85rem] leading-relaxed text-stone">The hero banner, promo banner, featured products, offers and homepage ordering live in Content.</p>
        <Link href="/admin/content" className="inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] hover:text-clay">
          Open content manager <ArrowRight className="size-4" />
        </Link>
      </AdminCard>
    </div>
  );
}

export function SettingsView() {
  return (
    <>
      <AdminPageHeader title="Settings" description="Store details, checkout rules, social links and search appearance." />
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="general"><GeneralTab /></TabsContent>
        <TabsContent value="homepage"><HomepageTab /></TabsContent>
        <TabsContent value="store"><StoreTab /></TabsContent>
        <TabsContent value="social"><SocialTab /></TabsContent>
        <TabsContent value="seo"><SeoTab /></TabsContent>
      </Tabs>
    </>
  );
}
