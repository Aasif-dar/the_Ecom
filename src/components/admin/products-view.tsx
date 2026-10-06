"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Copy, Eye, MoreHorizontal, Package, Pencil, Plus, Search, Trash2, Warehouse } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductStatus } from "@/types";
import { AdminCard, AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatINR } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, totalStock } from "@/lib/product-utils";
import { cn } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";

const PAGE = 15;
const STATUS_VARIANT: Record<ProductStatus, "success" | "warning" | "neutral"> = { active: "success", draft: "warning", archived: "neutral" };

function StockDrawer({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const setVariantStock = useCatalogStore((s) => s.setVariantStock);
  const live = useCatalogStore((s) => s.products.find((p) => p.id === product?.id));
  const [draft, setDraft] = useState<Record<string, number>>({});
  const p = live ?? product;
  if (!p) return null;
  const changed = Object.entries(draft).filter(([id, v]) => p.variants.find((x) => x.id === id)?.stock !== v);
  return (
    <Modal
      variant="drawer"
      open={!!product}
      onOpenChange={(o) => {
        if (!o) {
          setDraft({});
          onClose();
        }
      }}
      title="Manage stock"
      description={p.name}
      footer={
        <>
          <Button variant="ghost" onClick={() => { setDraft({}); onClose(); }}>
            Cancel
          </Button>
          <Button
            disabled={!changed.length}
            onClick={() => {
              changed.forEach(([id, v]) => setVariantStock(p.id, id, v));
              toast.success("Stock updated", { description: `${changed.length} variant${changed.length > 1 ? "s" : ""} changed. The shop reflects it now.` });
              setDraft({});
              onClose();
            }}
          >
            Save {changed.length ? `(${changed.length})` : ""}
          </Button>
        </>
      }
    >
      <ul className="divide-y divide-line border-y border-line">
        {p.variants.map((v) => {
          const value = draft[v.id] ?? v.stock;
          return (
            <li key={v.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-[0.875rem]">
                  {v.color}
                  {v.size !== "One Size" && <span className="text-stone"> · {v.size}</span>}
                </p>
                <p className="font-mono text-[0.7rem] text-stone">{v.sku}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Decrease" onClick={() => setDraft((d) => ({ ...d, [v.id]: Math.max(0, value - 1) }))} className="grid size-8 place-items-center border border-line hover:border-ink">
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => setDraft((d) => ({ ...d, [v.id]: Math.max(0, Math.floor(Number(e.target.value) || 0)) }))}
                  aria-label={`Stock for ${v.color} ${v.size}`}
                  className={cn("h-8 w-16 border border-line bg-paper text-center text-[0.85rem] tabular-nums outline-none focus:border-ink", value === 0 && "border-danger/50 bg-danger/[0.05]")}
                />
                <button type="button" aria-label="Increase" onClick={() => setDraft((d) => ({ ...d, [v.id]: value + 1 }))} className="grid size-8 place-items-center border border-line hover:border-ink">
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

export function ProductsView() {
  const router = useRouter();
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const duplicateProduct = useCatalogStore((s) => s.duplicateProduct);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [stockF, setStockF] = useState("all");
  const [page, setPage] = useState(1);
  const [stockFor, setStockFor] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const subName = useMemo(() => new Map(categories.flatMap((c) => c.subcategories.map((s) => [s.id, s.name] as const))), [categories]);
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (term && !(p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || p.tags.some((t) => t.includes(term)))) return false;
      if (cat !== "all" && p.categoryId !== cat) return false;
      if (status !== "all" && p.status !== status) return false;
      const s = totalStock(p);
      if (stockF === "out" && s !== 0) return false;
      if (stockF === "low" && !(s > 0 && s <= LOW_STOCK_THRESHOLD * 2)) return false;
      if (stockF === "in" && s <= LOW_STOCK_THRESHOLD * 2) return false;
      return true;
    });
  }, [products, q, cat, status, stockF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE);
  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const sel = (value: string, onChange: (v: string) => void, label: string, options: { value: string; label: string }[]) => (
    <Select value={value} onValueChange={(v) => reset(() => onChange(v as string))} items={options}>
      <SelectTrigger size="sm" aria-label={label} className="h-10 min-w-36">
        <SelectValue />
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

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${products.length} products · ${products.filter((p) => p.status === "active").length} live in the shop`}
        actions={
          <Link href="/admin/products/new" className={buttonVariants()}>
            <Plus className="size-4" /> Add product
          </Link>
        }
      />

      <AdminCard>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4 sm:p-5">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <Input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Search name, SKU or tag" aria-label="Search products" className="h-10 pl-10" />
          </div>
          {sel(cat, setCat, "Filter by category", [{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))])}
          {sel(status, setStatus, "Filter by status", [{ value: "all", label: "All statuses" }, { value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }])}
          {sel(stockF, setStockF, "Filter by stock", [{ value: "all", label: "Any stock" }, { value: "in", label: "In stock" }, { value: "low", label: "Low stock" }, { value: "out", label: "Sold out" }])}
        </div>

        {filtered.length === 0 ? (
          <EmptyState compact icon={Package} title="No products found" body="Try a different search or clear the filters." actions={<Button variant="outline" onClick={() => { setQ(""); setCat("all"); setStatus("all"); setStockF("all"); }}>Clear filters</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-left text-[0.8125rem]">
              <thead>
                <tr className="border-b border-line bg-bone/50 text-[0.65rem] uppercase tracking-[0.12em] text-stone">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 text-right font-medium">Price</th>
                  <th className="px-3 py-3 text-right font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const stock = totalStock(p);
                  return (
                    <tr key={p.id} className="border-b border-line/70 last:border-0 hover:bg-bone/40">
                      <td className="px-5 py-3">
                        <Link href={`/admin/products/${p.id}`} className="group flex items-center gap-3.5">
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-bone">
                            <Image src={p.images[0]} alt="" fill sizes="44px" unoptimized={p.images[0].startsWith("data:")} className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[18rem] truncate font-medium group-hover:text-clay">{p.name}</p>
                            <p className="mt-0.5 font-mono text-[0.7rem] text-stone">{p.sku}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-graphite">
                        {catName.get(p.categoryId)}
                        <span className="block text-[0.75rem] text-stone">{subName.get(p.subcategoryId)}</span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {formatINR(p.price)}
                        {p.mrp > p.price && <span className="block text-[0.72rem] text-stone line-through">{formatINR(p.mrp)}</span>}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button type="button" onClick={() => setStockFor(p)} title="Manage stock" className={cn("inline-flex items-center gap-1.5 border border-transparent px-2 py-1 tabular-nums transition-colors hover:border-ink", stock === 0 ? "font-medium text-danger" : stock <= LOW_STOCK_THRESHOLD * 2 ? "font-medium text-clay" : "")}>
                          {stock === 0 ? "Sold out" : stock}
                          <Warehouse className="size-3.5 text-stone" />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                          {p.isFeatured && <Badge variant="outline">Featured</Badge>}
                          {p.isBestSeller && <Badge variant="outline">Best seller</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger aria-label={`Actions for ${p.name}`} className="grid size-9 place-items-center hover:bg-bone data-popup-open:bg-bone">
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem render={<Link href={`/admin/products/${p.id}`} />} className="gap-3 px-3 py-2.5 text-[0.85rem]">
                              <Pencil /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href={`/product/${p.slug}`} target="_blank" />} className="gap-3 px-3 py-2.5 text-[0.85rem]">
                              <Eye /> View in shop
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 px-3 py-2.5 text-[0.85rem]" onClick={() => setStockFor(p)}>
                              <Warehouse /> Manage stock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-3 px-3 py-2.5 text-[0.85rem]"
                              onClick={() => {
                                const copy = duplicateProduct(p.id);
                                if (copy) {
                                  toast.success("Product duplicated", { description: "The copy is saved as a draft." });
                                  router.push(`/admin/products/${copy.id}`);
                                }
                              }}
                            >
                              <Copy /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-3 px-3 py-2.5 text-[0.85rem]"
                              onClick={() => {
                                const next = p.status === "active" ? "archived" : "active";
                                updateProduct(p.id, { status: next });
                                toast.success(next === "active" ? "Product is live in the shop" : "Product archived and hidden");
                              }}
                            >
                              <Archive /> {p.status === "active" ? "Archive" : "Make active"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" className="gap-3 px-3 py-2.5 text-[0.85rem]" onClick={() => setDeleting(p)}>
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-[0.78rem] text-stone">
          <span>
            Showing {filtered.length === 0 ? 0 : (current - 1) * PAGE + 1}–{Math.min(current * PAGE, filtered.length)} of {filtered.length}
          </span>
          <Pagination page={current} totalPages={totalPages} onChange={setPage} />
        </div>
      </AdminCard>

      <StockDrawer product={stockFor} onClose={() => setStockFor(null)} />

      <Modal
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this product?"
        description={deleting?.name}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleting) deleteProduct(deleting.id);
                toast.success("Product deleted");
                setDeleting(null);
              }}
            >
              Delete product
            </Button>
          </>
        }
      >
        <p className="text-[0.9rem] leading-relaxed text-graphite">It will vanish from the shop right away. Past orders keep their own copy of the item. Prefer Archive if you might bring it back.</p>
      </Modal>
    </>
  );
}
