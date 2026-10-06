"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Coupon, HeroSlide, Offer, PromoBanner } from "@/types";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { ImagePicker } from "@/components/admin/image-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatINR } from "@/lib/format";
import { useCatalogStore } from "@/store/catalog";
import { useSiteStore } from "@/store/site";

function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[0.78rem] text-stone">{hint}</p>}
    </div>
  );
}

function HeroEditor() {
  const hero = useSiteStore((s) => s.content.hero);
  const update = useSiteStore((s) => s.updateHero);
  const [d, setD] = useState<HeroSlide>(hero);
  useEffect(() => setD(hero), [hero]);
  const dirty = JSON.stringify(d) !== JSON.stringify(hero);
  const set = <K extends keyof HeroSlide>(k: K, v: HeroSlide[K]) => setD((x) => ({ ...x, [k]: v }));
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <AdminCard className="space-y-5 p-5 sm:p-7">
        <Row label="Promotional label"><Input value={d.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} /></Row>
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Headline"><Input value={d.title} onChange={(e) => set("title", e.target.value)} /></Row>
          <Row label="Headline (italic accent)"><Input value={d.titleAccent} onChange={(e) => set("titleAccent", e.target.value)} /></Row>
        </div>
        <Row label="Supporting text"><Textarea rows={3} value={d.body} onChange={(e) => set("body", e.target.value)} /></Row>
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Primary button text"><Input value={d.primaryCta.label} onChange={(e) => set("primaryCta", { ...d.primaryCta, label: e.target.value })} /></Row>
          <Row label="Primary button link"><Input value={d.primaryCta.href} onChange={(e) => set("primaryCta", { ...d.primaryCta, href: e.target.value })} /></Row>
          <Row label="Secondary button text"><Input value={d.secondaryCta.label} onChange={(e) => set("secondaryCta", { ...d.secondaryCta, label: e.target.value })} /></Row>
          <Row label="Secondary button link"><Input value={d.secondaryCta.href} onChange={(e) => set("secondaryCta", { ...d.secondaryCta, href: e.target.value })} /></Row>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <Row label="Main image"><ImagePicker label="Hero main" value={d.imageMain} onChange={(v) => set("imageMain", v)} /></Row>
          <Row label="Secondary image"><ImagePicker label="Hero secondary" value={d.imageSide} onChange={(v) => set("imageSide", v)} /></Row>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button
            disabled={!dirty}
            onClick={() => {
              if (!d.title.trim() || !d.primaryCta.label.trim()) return toast.error("Headline and primary button text are required");
              update(d);
              toast.success("Hero banner updated", { description: "The homepage reflects it immediately." });
            }}
          >
            Save hero
          </Button>
          <Button variant="ghost" disabled={!dirty} onClick={() => setD(hero)}>
            Discard
          </Button>
          <Link href="/" target="_blank" className="ml-auto inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] hover:text-clay">
            Preview <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </AdminCard>
      <AdminCard className="self-start p-5 sm:p-6">
        <p className="mb-4 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-stone">Preview</p>
        <div className="relative aspect-[4/5] overflow-hidden bg-ink text-paper">
          <Image src={d.imageMain} alt="" fill sizes="380px" unoptimized={d.imageMain.startsWith("data:") || d.imageMain.startsWith("http")} className="object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="eyebrow mb-3 text-[0.6rem] text-paper/80">{d.eyebrow}</p>
            <p className="font-serif text-[2.4rem] leading-[0.95]">{d.title} <em className="italic">{d.titleAccent}</em></p>
            <p className="mt-3 line-clamp-2 text-[0.8rem] text-paper/80">{d.body}</p>
            <div className="mt-4 flex gap-2 text-[0.6rem] font-medium uppercase tracking-[0.12em]">
              <span className="bg-paper px-3 py-2 text-ink">{d.primaryCta.label}</span>
              <span className="border border-paper/70 px-3 py-2">{d.secondaryCta.label}</span>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

function PromoEditor() {
  const promo = useSiteStore((s) => s.content.promo);
  const update = useSiteStore((s) => s.updatePromo);
  const [d, setD] = useState<PromoBanner>(promo);
  useEffect(() => setD(promo), [promo]);
  const dirty = JSON.stringify(d) !== JSON.stringify(promo);
  const set = <K extends keyof PromoBanner>(k: K, v: PromoBanner[K]) => setD((x) => ({ ...x, [k]: v }));
  return (
    <AdminCard className="max-w-3xl space-y-5 p-5 sm:p-7">
      <div className="flex items-center justify-between border-b border-line pb-5">
        <div>
          <p className="text-[0.9rem] font-medium">Show promotional banner</p>
          <p className="text-[0.78rem] text-stone">Appears between New Arrivals and Best Sellers.</p>
        </div>
        <Switch checked={d.active} onCheckedChange={(c) => set("active", c)} aria-label="Show promotional banner" />
      </div>
      <Row label="Label"><Input value={d.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} /></Row>
      <Row label="Headline" hint="The last word is set in italic."><Input value={d.title} onChange={(e) => set("title", e.target.value)} /></Row>
      <Row label="Supporting text"><Textarea rows={3} value={d.body} onChange={(e) => set("body", e.target.value)} /></Row>
      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Button text"><Input value={d.cta.label} onChange={(e) => set("cta", { ...d.cta, label: e.target.value })} /></Row>
        <Row label="Button link"><Input value={d.cta.href} onChange={(e) => set("cta", { ...d.cta, href: e.target.value })} /></Row>
      </div>
      <Row label="Background image"><ImagePicker label="Promo background" aspect="aspect-[16/10]" value={d.image} onChange={(v) => set("image", v)} /></Row>
      <div className="flex gap-3 pt-2">
        <Button disabled={!dirty} onClick={() => { update(d); toast.success("Promotional banner updated"); }}>
          Save banner
        </Button>
        <Button variant="ghost" disabled={!dirty} onClick={() => setD(promo)}>
          Discard
        </Button>
      </div>
    </AdminCard>
  );
}

function SectionsEditor() {
  const sections = useSiteStore((s) => s.content.sections);
  const toggle = useSiteStore((s) => s.toggleSection);
  const move = useSiteStore((s) => s.moveSection);
  return (
    <AdminCard className="max-w-2xl">
      <p className="border-b border-line px-5 py-4 text-[0.85rem] text-stone sm:px-6">Reorder or hide homepage sections. The hero banner always comes first.</p>
      <ol>
        {sections.map((s, i) => (
          <li key={s.id} className="flex items-center gap-4 border-b border-line/70 px-5 py-3.5 last:border-0 sm:px-6">
            <span className="w-5 text-[0.75rem] tabular-nums text-stone">{i + 1}</span>
            <span className={`flex-1 text-[0.9rem] ${s.enabled ? "" : "text-stone line-through"}`}>{s.label}</span>
            <button type="button" aria-label={`Move ${s.label} up`} disabled={i === 0} onClick={() => move(s.id, -1)} className="grid size-8 place-items-center hover:bg-bone disabled:opacity-30"><ArrowUp className="size-4" /></button>
            <button type="button" aria-label={`Move ${s.label} down`} disabled={i === sections.length - 1} onClick={() => move(s.id, 1)} className="grid size-8 place-items-center hover:bg-bone disabled:opacity-30"><ArrowDown className="size-4" /></button>
            <Switch checked={s.enabled} onCheckedChange={(c) => toggle(s.id, c)} aria-label={`Show ${s.label}`} />
          </li>
        ))}
      </ol>
    </AdminCard>
  );
}

function FeaturedEditor() {
  const ids = useSiteStore((s) => s.content.featuredProductIds);
  const updateContent = useSiteStore((s) => s.updateContent);
  const products = useCatalogStore((s) => s.products);
  const [q, setQ] = useState("");
  const chosen = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => p.status === "active" && !ids.includes(p.id) && (!t || p.name.toLowerCase().includes(t))).slice(0, 8);
  }, [products, ids, q]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard className="p-5 sm:p-6">
        <h3 className="font-serif text-[1.45rem] leading-none">Pinned to Best Sellers</h3>
        <p className="mb-5 mt-1.5 text-[0.8rem] text-stone">These appear first in the homepage Best Sellers row, in this order.</p>
        {chosen.length === 0 ? (
          <p className="border border-dashed border-line px-4 py-8 text-center text-[0.85rem] text-stone">Nothing pinned. Best Sellers are ranked by units sold.</p>
        ) : (
          <ol className="space-y-2">
            {chosen.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 border border-line bg-paper px-3 py-2.5">
                <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-bone"><Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" /></div>
                <span className="min-w-0 flex-1 truncate text-[0.85rem]">{p.name}</span>
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => { const n = [...ids]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; updateContent({ featuredProductIds: n }); }} className="grid size-7 place-items-center hover:bg-bone disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                <button type="button" aria-label="Move down" disabled={i === chosen.length - 1} onClick={() => { const n = [...ids]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; updateContent({ featuredProductIds: n }); }} className="grid size-7 place-items-center hover:bg-bone disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                <button type="button" aria-label={`Unpin ${p.name}`} onClick={() => updateContent({ featuredProductIds: ids.filter((x) => x !== p.id) })} className="grid size-7 place-items-center hover:bg-bone hover:text-danger"><X className="size-3.5" /></button>
              </li>
            ))}
          </ol>
        )}
      </AdminCard>
      <AdminCard className="p-5 sm:p-6">
        <h3 className="mb-4 font-serif text-[1.45rem] leading-none">Add a product</h3>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search active products" aria-label="Search products to pin" className="pl-10" />
        </div>
        <ul className="space-y-1.5">
          {results.map((p) => (
            <li key={p.id}>
              <button type="button" disabled={ids.length >= 8} onClick={() => { updateContent({ featuredProductIds: [...ids, p.id] }); toast.success("Pinned to Best Sellers", { description: p.name }); }} className="flex w-full items-center gap-3 border border-transparent px-2 py-2 text-left transition-colors hover:border-line hover:bg-bone/50 disabled:opacity-50">
                <div className="relative h-11 w-9 shrink-0 overflow-hidden bg-bone"><Image src={p.images[0]} alt="" fill sizes="36px" className="object-cover" /></div>
                <span className="min-w-0 flex-1 truncate text-[0.85rem]">{p.name}</span>
                <Plus className="size-4 text-stone" />
              </button>
            </li>
          ))}
        </ul>
        {ids.length >= 8 && <p className="mt-3 text-[0.78rem] text-stone">You can pin up to 8 products.</p>}
      </AdminCard>
    </div>
  );
}

function OffersEditor() {
  const offers = useSiteStore((s) => s.content.offers);
  const upsert = useSiteStore((s) => s.upsertOffer);
  const remove = useSiteStore((s) => s.deleteOffer);
  const [editing, setEditing] = useState<Offer | null>(null);
  const blank: Offer = { id: "", title: "", description: "", code: "", badge: "", href: "/shop", active: true };
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setEditing({ ...blank, id: `offer_${Date.now().toString(36)}` })}><Plus className="size-4" /> Add offer</Button>
      </div>
      <AdminCard>
        <ul className="divide-y divide-line">
          {offers.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="font-medium">{o.title}</p>
                  <Badge variant="clay">{o.badge}</Badge>
                  {o.code && <Badge variant="outline" className="font-mono">{o.code}</Badge>}
                </div>
                <p className="mt-1 text-[0.85rem] text-stone">{o.description}</p>
              </div>
              <Switch checked={o.active} onCheckedChange={(c) => upsert({ ...o, active: c })} aria-label={`${o.title} active`} />
              <button type="button" aria-label={`Edit ${o.title}`} onClick={() => setEditing(o)} className="grid size-8 place-items-center hover:bg-bone"><Pencil className="size-4" /></button>
              <button type="button" aria-label={`Delete ${o.title}`} onClick={() => { remove(o.id); toast("Offer deleted"); }} className="grid size-8 place-items-center hover:bg-bone hover:text-danger"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      </AdminCard>
      {editing && <OfferDialog offer={editing} onClose={() => setEditing(null)} onSave={(o) => { upsert(o); toast.success("Offer saved"); setEditing(null); }} />}
    </>
  );
}

function OfferDialog({ offer, onClose, onSave }: { offer: Offer; onClose: () => void; onSave: (o: Offer) => void }) {
  const [d, setD] = useState(offer);
  const set = <K extends keyof Offer>(k: K, v: Offer[K]) => setD((x) => ({ ...x, [k]: v }));
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={offer.title ? "Edit offer" : "Add offer"} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => { if (!d.title.trim() || !d.description.trim()) return toast.error("Title and description are required"); onSave({ ...d, code: d.code?.trim().toUpperCase() || undefined }); }}>Save offer</Button></>}>
      <div className="space-y-4">
        <Row label="Title"><Input value={d.title} onChange={(e) => set("title", e.target.value)} /></Row>
        <Row label="Description"><Textarea rows={2} value={d.description} onChange={(e) => set("description", e.target.value)} /></Row>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Badge"><Input value={d.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Limited time" /></Row>
          <Row label="Code (optional)"><Input value={d.code ?? ""} onChange={(e) => set("code", e.target.value)} className="font-mono uppercase" /></Row>
        </div>
        <Row label="Link"><Input value={d.href} onChange={(e) => set("href", e.target.value)} /></Row>
      </div>
    </Modal>
  );
}

function AnnouncementsEditor() {
  const list = useSiteStore((s) => s.content.announcements);
  const updateContent = useSiteStore((s) => s.updateContent);
  const [d, setD] = useState(list);
  useEffect(() => setD(list), [list]);
  const dirty = JSON.stringify(d) !== JSON.stringify(list);
  return (
    <AdminCard className="max-w-2xl space-y-3 p-5 sm:p-7">
      <p className="text-[0.85rem] text-stone">Rotating messages in the bar above the navigation.</p>
      {d.map((m, i) => (
        <div key={i} className="flex gap-2">
          <Input value={m} onChange={(e) => setD((x) => x.map((v, j) => (j === i ? e.target.value : v)))} aria-label={`Message ${i + 1}`} />
          <button type="button" aria-label="Remove message" onClick={() => setD((x) => x.filter((_, j) => j !== i))} className="grid size-11 shrink-0 place-items-center border border-line hover:border-danger hover:text-danger"><Trash2 className="size-4" /></button>
        </div>
      ))}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="outline" onClick={() => setD((x) => [...x, ""])}><Plus className="size-4" /> Add message</Button>
        <Button disabled={!dirty} onClick={() => { updateContent({ announcements: d.map((m) => m.trim()).filter(Boolean) }); toast.success("Announcement bar updated"); }}>Save</Button>
      </div>
    </AdminCard>
  );
}

function CouponsEditor() {
  const coupons = useSiteStore((s) => s.coupons);
  const upsert = useSiteStore((s) => s.upsertCoupon);
  const remove = useSiteStore((s) => s.deleteCoupon);
  const [editing, setEditing] = useState<{ coupon: Coupon; isNew: boolean } | null>(null);
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setEditing({ isNew: true, coupon: { code: "", type: "percent", value: 10, minOrder: 1000, description: "", active: true, expiresAt: new Date(Date.now() + 90 * 864e5).toISOString(), usageCount: 0 } })}><Plus className="size-4" /> Add coupon</Button>
      </div>
      <AdminCard className="overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-[0.8125rem]">
          <thead>
            <tr className="border-b border-line bg-bone/50 text-[0.65rem] uppercase tracking-[0.12em] text-stone">
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-3 py-3 font-medium">Discount</th>
              <th className="px-3 py-3 font-medium">Min. order</th>
              <th className="px-3 py-3 font-medium">Expires</th>
              <th className="px-3 py-3 text-right font-medium">Used</th>
              <th className="px-3 py-3 font-medium">Active</th>
              <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className="border-b border-line/70 last:border-0">
                <td className="px-5 py-3 font-mono font-medium tracking-wider">{c.code}</td>
                <td className="px-3 py-3">{c.type === "percent" ? `${c.value}%${c.maxDiscount ? ` (max ${formatINR(c.maxDiscount)})` : ""}` : formatINR(c.value)}</td>
                <td className="px-3 py-3 tabular-nums">{formatINR(c.minOrder)}</td>
                <td className="px-3 py-3 text-graphite">{formatDate(c.expiresAt)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{c.usageCount}</td>
                <td className="px-3 py-3"><Switch checked={c.active} onCheckedChange={(a) => upsert({ ...c, active: a })} aria-label={`${c.code} active`} /></td>
                <td className="px-5 py-3 text-right">
                  <button type="button" aria-label={`Edit ${c.code}`} onClick={() => setEditing({ coupon: c, isNew: false })} className="grid size-8 place-items-center hover:bg-bone"><Pencil className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminCard>
      {editing && <CouponDialog {...editing} existing={coupons.map((c) => c.code)} onClose={() => setEditing(null)} onSave={(c) => { upsert(c); toast.success("Coupon saved"); setEditing(null); }} onDelete={(code) => { remove(code); toast("Coupon deleted"); setEditing(null); }} />}
    </>
  );
}

function CouponDialog({ coupon, isNew, existing, onClose, onSave, onDelete }: { coupon: Coupon; isNew: boolean; existing: string[]; onClose: () => void; onSave: (c: Coupon) => void; onDelete: (code: string) => void }) {
  const [d, setD] = useState(coupon);
  const set = <K extends keyof Coupon>(k: K, v: Coupon[K]) => setD((x) => ({ ...x, [k]: v }));
  const save = () => {
    const code = d.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,16}$/.test(code)) return toast.error("Code must be 4–16 letters or numbers");
    if (isNew && existing.includes(code)) return toast.error("That code already exists");
    if (d.value <= 0 || (d.type === "percent" && d.value > 90)) return toast.error("Enter a valid discount value");
    onSave({ ...d, code, maxDiscount: d.type === "percent" && d.maxDiscount ? d.maxDiscount : undefined });
  };
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={isNew ? "Add coupon" : `Edit ${coupon.code}`} footer={<>{!isNew && <Button variant="destructive" className="sm:mr-auto" onClick={() => onDelete(coupon.code)}>Delete</Button>}<Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>Save coupon</Button></>}>
      <div className="space-y-4">
        <Row label="Code"><Input value={d.code} disabled={!isNew} onChange={(e) => set("code", e.target.value.toUpperCase())} className="font-mono uppercase" /></Row>
        <Row label="Description"><Input value={d.description} onChange={(e) => set("description", e.target.value)} /></Row>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Type">
            <Select value={d.type} onValueChange={(v) => set("type", v as Coupon["type"])} items={[{ value: "percent", label: "Percentage" }, { value: "flat", label: "Flat amount" }]}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent alignItemWithTrigger={false}><SelectItem value="percent">Percentage</SelectItem><SelectItem value="flat">Flat amount</SelectItem></SelectContent>
            </Select>
          </Row>
          <Row label={d.type === "percent" ? "Percent off" : "Amount off (₹)"}><Input type="number" min={1} value={d.value} onChange={(e) => set("value", Number(e.target.value))} /></Row>
          <Row label="Minimum order (₹)"><Input type="number" min={0} value={d.minOrder} onChange={(e) => set("minOrder", Number(e.target.value))} /></Row>
          {d.type === "percent" && <Row label="Max discount (₹)"><Input type="number" min={0} value={d.maxDiscount ?? ""} onChange={(e) => set("maxDiscount", e.target.value ? Number(e.target.value) : undefined)} /></Row>}
          <Row label="Expires"><Input type="date" value={d.expiresAt.slice(0, 10)} onChange={(e) => set("expiresAt", new Date(`${e.target.value}T23:59:59+05:30`).toISOString())} /></Row>
        </div>
      </div>
    </Modal>
  );
}

export function ContentView() {
  return (
    <>
      <AdminPageHeader title="Content" description="Manage the banners, sections and offers that shape the storefront. Changes go live instantly." />
      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero banner</TabsTrigger>
          <TabsTrigger value="promo">Promo banner</TabsTrigger>
          <TabsTrigger value="sections">Homepage sections</TabsTrigger>
          <TabsTrigger value="featured">Featured products</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="announcements">Announcement bar</TabsTrigger>
        </TabsList>
        <TabsContent value="hero"><HeroEditor /></TabsContent>
        <TabsContent value="promo"><PromoEditor /></TabsContent>
        <TabsContent value="sections"><SectionsEditor /></TabsContent>
        <TabsContent value="featured"><FeaturedEditor /></TabsContent>
        <TabsContent value="offers"><OffersEditor /></TabsContent>
        <TabsContent value="coupons"><CouponsEditor /></TabsContent>
        <TabsContent value="announcements"><AnnouncementsEditor /></TabsContent>
      </Tabs>
    </>
  );
}
