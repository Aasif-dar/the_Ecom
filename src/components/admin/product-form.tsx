"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductStatus, SizeGuideKind } from "@/types";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { ImageManager } from "@/components/admin/image-manager";
import { TagInput } from "@/components/admin/tag-input";
import { ColorsEditor, SizesEditor, VariantMatrix } from "@/components/admin/variants-editor";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { COLLECTIONS } from "@/data/categories";
import { discountPercent, formatINR, slugify } from "@/lib/format";
import { syncVariants, totalStock } from "@/lib/product-utils";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";

const schema = z
  .object({
    name: z.string().trim().min(3, "Enter a product name (at least 3 characters)").max(120),
    slug: z.string().trim().min(3, "Enter a URL slug").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
    shortDescription: z.string().trim().min(10, "Add a one-line summary (at least 10 characters)").max(240),
    description: z.string().trim().min(20, "Describe the product (at least 20 characters)"),
    categoryId: z.string().min(1, "Choose a category"),
    subcategoryId: z.string().min(1, "Choose a subcategory"),
    price: z.number({ required_error: "Enter the sale price", invalid_type_error: "Enter the sale price" }).positive("Price must be above zero").max(1000000),
    mrp: z.number({ required_error: "Enter the regular price", invalid_type_error: "Enter the regular price" }).positive("Price must be above zero").max(1000000),
    sku: z.string().trim().min(3, "Enter a SKU").regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and hyphens only"),
    tags: z.array(z.string()),
    collections: z.array(z.string()),
    fabric: z.string().trim().min(2, "Describe the fabric or material"),
    fit: z.string().trim().min(2, "Describe the fit"),
    care: z.string().trim().min(2, "Add care instructions"),
    details: z.string(),
    sizeGuide: z.enum(["tops", "bottoms", "footwear", "free"]),
    status: z.enum(["active", "draft", "archived"]),
    isNew: z.boolean(),
    isBestSeller: z.boolean(),
    isFeatured: z.boolean(),
    images: z.array(z.string()).min(1, "Add at least one image"),
    sizes: z.array(z.string()).min(1, "Add at least one size"),
    colors: z.array(z.object({ name: z.string(), hex: z.string() })).min(1, "Add at least one colour"),
    variants: z.array(z.object({ id: z.string(), sku: z.string(), color: z.string(), size: z.string(), stock: z.number().int().min(0) })),
  })
  .refine((v) => v.price <= v.mrp, { path: ["price"], message: "Sale price can't be higher than the regular price" });
type Values = z.infer<typeof schema>;

const GUIDES: { value: SizeGuideKind; label: string }[] = [
  { value: "tops", label: "Tops & shirts" },
  { value: "bottoms", label: "Trousers & denim" },
  { value: "footwear", label: "Footwear" },
  { value: "free", label: "One size / not applicable" },
];
const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "active", label: "Active (visible in the shop)" },
  { value: "draft", label: "Draft (hidden)" },
  { value: "archived", label: "Archived (hidden)" },
];

function defaults(p?: Product): Values {
  return p
    ? {
        name: p.name, slug: p.slug, shortDescription: p.shortDescription, description: p.description, categoryId: p.categoryId, subcategoryId: p.subcategoryId,
        price: p.price, mrp: p.mrp, sku: p.sku, tags: p.tags, collections: p.collections, fabric: p.fabric, fit: p.fit, care: p.care,
        details: p.details.join("\n"), sizeGuide: p.sizeGuide, status: p.status, isNew: p.isNew, isBestSeller: p.isBestSeller, isFeatured: p.isFeatured,
        images: p.images, sizes: p.sizes, colors: p.colors, variants: p.variants,
      }
    : {
        name: "", slug: "", shortDescription: "", description: "", categoryId: "", subcategoryId: "", price: 0, mrp: 0, sku: "", tags: [], collections: [],
        fabric: "", fit: "", care: "Machine wash cold. Dry in shade. Iron on low heat.", details: "", sizeGuide: "tops", status: "active", isNew: true, isBestSeller: false, isFeatured: false,
        images: [], sizes: [], colors: [], variants: [],
      };
}

function SelectField<T extends string>({ value, onChange, options, placeholder, id, invalid }: { value: T | ""; onChange: (v: T) => void; options: { value: T; label: string }[]; placeholder?: string; id?: string; invalid?: boolean }) {
  return (
    <Select value={value as string} onValueChange={(v) => onChange(v as T)} items={options}>
      <SelectTrigger id={id} aria-invalid={invalid} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const categories = useCatalogStore((s) => s.categories);
  const addProduct = useCatalogStore((s) => s.addProduct);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const slugTouched = useRef(!!product);

  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults(product), mode: "onTouched" });
  const { register, handleSubmit, control, setValue, getValues, formState: { errors, isSubmitting, isDirty } } = form;

  const name = useWatch({ control, name: "name" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const colors = useWatch({ control, name: "colors" });
  const sizes = useWatch({ control, name: "sizes" });
  const variants = useWatch({ control, name: "variants" });
  const price = useWatch({ control, name: "price" });
  const mrp = useWatch({ control, name: "mrp" });
  const sku = useWatch({ control, name: "sku" });

  const category = categories.find((c) => c.id === categoryId);
  const subOptions = useMemo(() => (category?.subcategories ?? []).map((s) => ({ value: s.id, label: s.name })), [category]);

  useEffect(() => {
    if (!slugTouched.current) setValue("slug", slugify(name), { shouldValidate: !!name });
  }, [name, setValue]);

  // keep the variant matrix in step with the chosen colours and sizes (preserving stock already entered)
  useEffect(() => {
    const current = getValues("variants");
    const next = syncVariants(getValues("sku") || "NEW", colors, sizes, current);
    const same = next.length === current.length && next.every((v, i) => v.id === current[i]?.id);
    if (!same) setValue("variants", next, { shouldDirty: true });
  }, [colors, sizes, getValues, setValue]);

  const stock = (variants ?? []).reduce((s, v) => s + (v.stock || 0), 0);
  const pct = discountPercent(price || 0, mrp || 0);

  const save = async (v: Values, forceStatus?: ProductStatus) => {
    await new Promise((r) => setTimeout(r, 350));
    const data = {
      name: v.name, slug: v.slug, shortDescription: v.shortDescription, description: v.description, categoryId: v.categoryId, subcategoryId: v.subcategoryId,
      price: v.price, mrp: v.mrp, sku: v.sku, images: v.images, colors: v.colors, sizes: v.sizes, variants: v.variants,
      tags: v.tags, collections: v.collections, fabric: v.fabric, fit: v.fit, care: v.care,
      details: v.details.split("\n").map((l) => l.trim()).filter(Boolean), sizeGuide: v.sizeGuide,
      status: forceStatus ?? v.status, isNew: v.isNew, isBestSeller: v.isBestSeller, isFeatured: v.isFeatured,
    };
    if (product) {
      updateProduct(product.id, data);
      toast.success("Product updated", { description: `${v.name} · ${stock} units in stock` });
    } else {
      addProduct(data);
      toast.success("Product created", { description: data.status === "active" ? "It's now live in the shop." : "Saved as a draft." });
    }
    router.push("/admin/products");
  };

  const onInvalid = () => toast.error("Please fix the highlighted fields", { description: "Some required information is missing or invalid." });

  return (
    <>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-graphite hover:text-ink">
        <ArrowLeft className="size-4" /> All products
      </Link>
      <AdminPageHeader
        title={product ? "Edit product" : "Add product"}
        description={product ? `${product.sku} · ${stock} units in stock` : "Fill in the details below. Active products appear in the shop immediately."}
        actions={
          product && (
            <>
              <Link href={`/product/${product.slug}`} target="_blank" className="inline-flex h-11 items-center gap-2 border border-ink px-5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] hover:bg-ink hover:text-paper">
                <ExternalLink className="size-4" /> View in shop
              </Link>
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4" /> Delete
              </Button>
            </>
          )
        }
      />

      <form id="product-form" noValidate onSubmit={handleSubmit((v) => save(v), onInvalid)} className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-6">
          <AdminCard className="space-y-5 p-5 sm:p-7" aria-labelledby="pf-basic">
            <h2 id="pf-basic" className="font-serif text-[1.5rem] leading-none">Basic information</h2>
            <Field label="Product name" error={errors.name} required>
              {(p) => <Input placeholder="e.g. Linen Mandarin-Collar Shirt" {...p} {...register("name")} />}
            </Field>
            <Field label="URL slug" error={errors.slug} hint={`/product/${getValues("slug") || "your-product"}`}>
              {(p) => <Input {...p} {...register("slug", { onChange: () => (slugTouched.current = true) })} />}
            </Field>
            <Field label="Short description" error={errors.shortDescription} required hint="Shown on cards, search and social previews.">
              {(p) => <Input {...p} {...register("shortDescription")} />}
            </Field>
            <Field label="Description" error={errors.description} required hint="Separate paragraphs with a blank line.">
              {(p) => <Textarea rows={6} {...p} {...register("description")} />}
            </Field>
          </AdminCard>

          <AdminCard className="space-y-4 p-5 sm:p-7" aria-labelledby="pf-media">
            <div>
              <h2 id="pf-media" className="font-serif text-[1.5rem] leading-none">Images</h2>
              <p className="mt-1.5 text-[0.8rem] text-stone">Drag to reorder. The first image is the primary image and is used on cards.</p>
            </div>
            <Controller control={control} name="images" render={({ field }) => <ImageManager value={field.value} onChange={(v) => field.onChange(v)} error={errors.images?.message} />} />
          </AdminCard>

          <AdminCard className="space-y-8 p-5 sm:p-7" aria-labelledby="pf-var">
            <div>
              <h2 id="pf-var" className="font-serif text-[1.5rem] leading-none">Variants & inventory</h2>
              <p className="mt-1.5 text-[0.8rem] text-stone">Every colour × size combination gets its own SKU and stock level.</p>
            </div>
            <div>
              <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Colours</p>
              <Controller control={control} name="colors" render={({ field }) => <ColorsEditor value={field.value} onChange={field.onChange} error={errors.colors?.message} />} />
            </div>
            <div>
              <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Sizes</p>
              <Controller control={control} name="sizes" render={({ field }) => <SizesEditor value={field.value} onChange={field.onChange} error={errors.sizes?.message} />} />
            </div>
            <div>
              <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Stock by variant</p>
              <Controller control={control} name="variants" render={({ field }) => <VariantMatrix value={field.value} onChange={field.onChange} />} />
            </div>
          </AdminCard>

          <AdminCard className="space-y-5 p-5 sm:p-7" aria-labelledby="pf-det">
            <h2 id="pf-det" className="font-serif text-[1.5rem] leading-none">Product details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Fabric / material" error={errors.fabric} required>
                {(p) => <Input placeholder="e.g. 100% cotton poplin" {...p} {...register("fabric")} />}
              </Field>
              <Field label="Fit" error={errors.fit} required>
                {(p) => <Input placeholder="e.g. Regular fit" {...p} {...register("fit")} />}
              </Field>
            </div>
            <Field label="Care instructions" error={errors.care} required>
              {(p) => <Input {...p} {...register("care")} />}
            </Field>
            <Field label="Highlights" hint="One per line, e.g. “Made in Lucknow, India”. Shown under Product details.">
              {(p) => <Textarea rows={4} {...p} {...register("details")} />}
            </Field>
            <Field label="Size guide">
              {(p) => <Controller control={control} name="sizeGuide" render={({ field }) => <SelectField id={p.id} value={field.value} onChange={field.onChange} options={GUIDES} />} />}
            </Field>
          </AdminCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <AdminCard className="space-y-5 p-5 sm:p-6" aria-labelledby="pf-pub">
            <h2 id="pf-pub" className="font-serif text-[1.4rem] leading-none">Publish</h2>
            <Field label="Status">
              {(p) => <Controller control={control} name="status" render={({ field }) => <SelectField id={p.id} value={field.value} onChange={field.onChange} options={STATUSES} />} />}
            </Field>
            <ul className="space-y-3.5 border-t border-line pt-4">
              {([
                ["isNew", "New arrival", "Shown in New Arrivals"],
                ["isBestSeller", "Best seller", "Shown in Best Sellers"],
                ["isFeatured", "Featured", "Ranked first in listings"],
              ] as const).map(([key, label, hint]) => (
                <li key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p id={`flag-${key}`} className="text-[0.875rem] font-medium">{label}</p>
                    <p className="text-[0.75rem] text-stone">{hint}</p>
                  </div>
                  <Controller control={control} name={key} render={({ field }) => <Switch aria-labelledby={`flag-${key}`} checked={field.value} onCheckedChange={field.onChange} />} />
                </li>
              ))}
            </ul>
          </AdminCard>

          <AdminCard className="space-y-5 p-5 sm:p-6" aria-labelledby="pf-price">
            <h2 id="pf-price" className="font-serif text-[1.4rem] leading-none">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sale price (₹)" error={errors.price} required>
                {(p) => <Input type="number" min={0} step={1} inputMode="numeric" {...p} {...register("price", { valueAsNumber: true })} />}
              </Field>
              <Field label="Regular (MRP)" error={errors.mrp} required>
                {(p) => <Input type="number" min={0} step={1} inputMode="numeric" {...p} {...register("mrp", { valueAsNumber: true })} />}
              </Field>
            </div>
            {price > 0 && mrp > 0 && price <= mrp && (
              <p className="flex items-baseline justify-between bg-bone px-3.5 py-2.5 text-[0.8125rem]">
                <span>
                  Shows as <strong className="font-medium tabular-nums">{formatINR(price)}</strong>
                  {pct > 0 && <span className="ml-1.5 text-stone line-through tabular-nums">{formatINR(mrp)}</span>}
                </span>
                {pct > 0 && <span className="font-medium text-clay">{pct}% off</span>}
              </p>
            )}
            <Field label="SKU" error={errors.sku} required>
              {(p) => <Input className="font-mono uppercase" placeholder="AAD-MEN-035" {...p} {...register("sku")} />}
            </Field>
            <p className="text-[0.8rem] text-stone">
              Total stock: <strong className={cn("font-medium tabular-nums", stock === 0 ? "text-danger" : "text-ink")}>{stock}</strong> units{sku ? ` · ${sku}` : ""}
            </p>
          </AdminCard>

          <AdminCard className="space-y-5 p-5 sm:p-6" aria-labelledby="pf-org">
            <h2 id="pf-org" className="font-serif text-[1.4rem] leading-none">Organisation</h2>
            <Field label="Category" error={errors.categoryId} required>
              {(p) => (
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <SelectField
                      id={p.id}
                      invalid={p["aria-invalid"]}
                      value={field.value}
                      placeholder="Choose a category"
                      onChange={(v) => {
                        field.onChange(v);
                        setValue("subcategoryId", "", { shouldValidate: false });
                      }}
                      options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    />
                  )}
                />
              )}
            </Field>
            <Field label="Subcategory" error={errors.subcategoryId} required>
              {(p) => (
                <Controller
                  control={control}
                  name="subcategoryId"
                  render={({ field }) => <SelectField id={p.id} invalid={p["aria-invalid"]} value={field.value} placeholder={category ? "Choose a subcategory" : "Choose a category first"} onChange={field.onChange} options={subOptions} />}
                />
              )}
            </Field>
            <Field label="Tags" hint="Used by search. Press Enter after each tag.">
              {() => <Controller control={control} name="tags" render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />} />}
            </Field>
            <fieldset>
              <legend className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Collections</legend>
              <Controller
                control={control}
                name="collections"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {COLLECTIONS.map((c) => {
                      const on = field.value.includes(c.slug);
                      return (
                        <button key={c.slug} type="button" aria-pressed={on} onClick={() => field.onChange(on ? field.value.filter((x) => x !== c.slug) : [...field.value, c.slug])} className={cn("border px-3 py-1.5 text-[0.78rem] transition-colors", on ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 hover:border-ink")}>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </fieldset>
          </AdminCard>
        </aside>
      </form>

      <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper-2/95 px-4 py-4 sm:-mx-8 sm:px-8">
        <p className="text-[0.8rem] text-stone">{isDirty ? "You have unsaved changes." : "All changes saved."}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleSubmit((v) => save(v, "draft"), onInvalid)}>
            Save as draft
          </Button>
          <Button type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : product ? "Save changes" : "Publish product"}
          </Button>
        </div>
      </div>

      {product && (
        <Modal
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Delete this product?"
          description={product.name}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Keep it
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteProduct(product.id);
                  toast.success("Product deleted");
                  router.push("/admin/products");
                }}
              >
                Delete product
              </Button>
            </>
          }
        >
          <p className="text-[0.9rem] leading-relaxed text-graphite">It will disappear from the shop immediately. Existing orders keep their copy of the item. To hide it without deleting, set its status to Archived instead.</p>
        </Modal>
      )}
    </>
  );
}
