"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category, Subcategory } from "@/types";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { ImagePicker } from "@/components/admin/image-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCatalogStore } from "@/store/catalog";
import { useEffect } from "react";

const catSchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(40),
  description: z.string().trim().min(5, "Add a short description").max(160),
});
type CatValues = z.infer<typeof catSchema>;

function CategoryDialog({ open, onOpenChange, category }: { open: boolean; onOpenChange: (o: boolean) => void; category: Category | null }) {
  const add = useCatalogStore((s) => s.addCategory);
  const update = useCatalogStore((s) => s.updateCategory);
  const categories = useCatalogStore((s) => s.categories);
  const [image, setImage] = useState("/images/editorial/cat-new.jpg");
  const [active, setActive] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CatValues>({ resolver: zodResolver(catSchema) });

  useEffect(() => {
    if (!open) return;
    reset({ name: category?.name ?? "", description: category?.description ?? "" });
    setImage(category?.image ?? "/images/editorial/cat-new.jpg");
    setActive(category ? category.status === "active" : true);
  }, [open, category, reset]);

  return (
    <Modal
      variant="drawer"
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Edit category" : "Add category"}
      description="Categories appear in the shop navigation and the mega menu."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="cat-form" disabled={isSubmitting}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form
        id="cat-form"
        noValidate
        className="space-y-6"
        onSubmit={handleSubmit(async (v) => {
          if (categories.some((c) => c.id !== category?.id && c.name.toLowerCase() === v.name.toLowerCase())) return setError("name", { message: "A category with this name already exists" });
          await new Promise((r) => setTimeout(r, 250));
          if (category) update(category.id, { name: v.name, description: v.description, image, status: active ? "active" : "hidden" });
          else {
            const c = add({ name: v.name, description: v.description, image });
            if (!active) update(c.id, { status: "hidden" });
          }
          toast.success(category ? "Category updated" : "Category created");
          onOpenChange(false);
        })}
      >
        <Field label="Name" error={errors.name} required>
          {(p) => <Input {...p} {...register("name")} />}
        </Field>
        <Field label="Description" error={errors.description} required>
          {(p) => <Textarea rows={3} {...p} {...register("description")} />}
        </Field>
        <div>
          <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-graphite">Image</p>
          <ImagePicker label="Category image" value={image} onChange={setImage} />
        </div>
        <label className="flex items-center justify-between gap-4 border-t border-line pt-5">
          <span>
            <span className="block text-[0.9rem] font-medium">Visible in the shop</span>
            <span className="block text-[0.78rem] text-stone">Hidden categories disappear from navigation.</span>
          </span>
          <Switch checked={active} onCheckedChange={setActive} />
        </label>
      </form>
    </Modal>
  );
}

function SubDialog({ open, onOpenChange, category, sub }: { open: boolean; onOpenChange: (o: boolean) => void; category: Category | null; sub: Subcategory | null }) {
  const addSub = useCatalogStore((s) => s.addSubcategory);
  const updateSub = useCatalogStore((s) => s.updateSubcategory);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setName(sub?.name ?? "");
      setError("");
    }
  }, [open, sub]);
  if (!category) return null;
  const save = () => {
    const n = name.trim();
    if (n.length < 2) return setError("Enter a name (at least 2 characters)");
    if (category.subcategories.some((s) => s.id !== sub?.id && s.name.toLowerCase() === n.toLowerCase())) return setError("This subcategory already exists");
    if (sub) updateSub(sub.id, { name: n });
    else addSub(category.id, n);
    toast.success(sub ? "Subcategory updated" : "Subcategory added");
    onOpenChange(false);
  };
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={sub ? "Edit subcategory" : "Add subcategory"}
      description={`In ${category.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{sub ? "Save" : "Add subcategory"}</Button>
        </>
      }
    >
      <Field label="Name" error={error ? { message: error } : undefined} required>
        {(p) => <Input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && save()} autoFocus {...p} />}
      </Field>
    </Modal>
  );
}

export function CategoriesView() {
  const categories = useCatalogStore((s) => s.categories);
  const products = useCatalogStore((s) => s.products);
  const deleteCategory = useCatalogStore((s) => s.deleteCategory);
  const deleteSub = useCatalogStore((s) => s.deleteSubcategory);
  const updateSub = useCatalogStore((s) => s.updateSubcategory);

  const [catOpen, setCatOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [subOpen, setSubOpen] = useState(false);
  const [subCat, setSubCat] = useState<Category | null>(null);
  const [editSub, setEditSub] = useState<Subcategory | null>(null);
  const [delCat, setDelCat] = useState<Category | null>(null);

  const counts = useMemo(() => {
    const byCat = new Map<string, number>();
    const bySub = new Map<string, number>();
    for (const p of products) {
      byCat.set(p.categoryId, (byCat.get(p.categoryId) ?? 0) + 1);
      bySub.set(p.subcategoryId, (bySub.get(p.subcategoryId) ?? 0) + 1);
    }
    return { byCat, bySub };
  }, [products]);

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Organise the range. Changes appear in the shop navigation immediately."
        actions={
          <Button onClick={() => { setEditCat(null); setCatOpen(true); }}>
            <Plus className="size-4" /> Add category
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {categories.map((c) => {
          const n = counts.byCat.get(c.id) ?? 0;
          return (
            <AdminCard key={c.id} className="flex flex-col">
              <div className="flex gap-5 p-5 sm:p-6">
                <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-bone sm:h-36 sm:w-28">
                  <Image src={c.image} alt={c.name} fill sizes="120px" unoptimized={c.image.startsWith("data:") || c.image.startsWith("http")} className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-serif text-[1.9rem] leading-none">{c.name}</h2>
                    <Badge variant={c.status === "active" ? "success" : "neutral"}>{c.status === "active" ? "Active" : "Hidden"}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[0.85rem] text-stone">{c.description}</p>
                  <p className="mt-3 text-[0.8125rem]">
                    <strong className="font-medium tabular-nums">{n}</strong> <span className="text-stone">products ·</span> <strong className="font-medium tabular-nums">{c.subcategories.length}</strong> <span className="text-stone">subcategories</span>
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditCat(c); setCatOpen(true); }}>
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-graphite hover:text-danger" onClick={() => setDelCat(c)}>
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 border-t border-line">
                <div className="flex items-center justify-between px-5 py-3 sm:px-6">
                  <h3 className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.14em] text-stone">Subcategories</h3>
                  <button type="button" onClick={() => { setSubCat(c); setEditSub(null); setSubOpen(true); }} className="inline-flex items-center gap-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] hover:text-clay">
                    <Plus className="size-3.5" /> Add
                  </button>
                </div>
                <ul className="divide-y divide-line/70 border-t border-line/70">
                  {c.subcategories.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-[0.85rem] sm:px-6">
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="truncate">{s.name}</span>
                        {s.status === "hidden" && <Badge variant="neutral">Hidden</Badge>}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="mr-2 text-[0.78rem] tabular-nums text-stone">{counts.bySub.get(s.id) ?? 0}</span>
                        <button type="button" aria-label={`${s.status === "active" ? "Hide" : "Show"} ${s.name}`} onClick={() => updateSub(s.id, { status: s.status === "active" ? "hidden" : "active" })} className="px-1.5 py-1 text-[0.7rem] uppercase tracking-[0.1em] text-stone hover:text-ink">
                          {s.status === "active" ? "Hide" : "Show"}
                        </button>
                        <button type="button" aria-label={`Edit ${s.name}`} onClick={() => { setSubCat(c); setEditSub(s); setSubOpen(true); }} className="grid size-7 place-items-center text-stone hover:bg-bone hover:text-ink">
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${s.name}`}
                          onClick={() => {
                            if (!deleteSub(s.id)) toast.error("Can't delete a subcategory that still has products", { description: "Move or delete its products first." });
                            else toast.success("Subcategory deleted");
                          }}
                          className="grid size-7 place-items-center text-stone hover:bg-bone hover:text-danger"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                  {c.subcategories.length === 0 && <li className="px-5 py-5 text-[0.85rem] text-stone sm:px-6">No subcategories yet.</li>}
                </ul>
              </div>
            </AdminCard>
          );
        })}
      </div>

      <CategoryDialog open={catOpen} onOpenChange={setCatOpen} category={editCat} />
      <SubDialog open={subOpen} onOpenChange={setSubOpen} category={subCat} sub={editSub} />

      <Modal
        open={!!delCat}
        onOpenChange={(o) => !o && setDelCat(null)}
        title="Delete category?"
        description={delCat?.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDelCat(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (delCat && !deleteCategory(delCat.id)) toast.error(`${delCat.name} still has ${counts.byCat.get(delCat.id)} products`, { description: "Move or delete them first, or hide the category instead." });
                else toast.success("Category deleted");
                setDelCat(null);
              }}
            >
              Delete category
            </Button>
          </>
        }
      >
        <p className="text-[0.9rem] leading-relaxed text-graphite">A category can only be deleted when it has no products. Hide it instead to remove it from navigation without losing anything.</p>
      </Modal>
    </>
  );
}
