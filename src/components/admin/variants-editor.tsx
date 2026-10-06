"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ProductColor, Variant } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLOR_HEX } from "@/data/colors";
import { cn } from "@/lib/utils";

const SIZE_PRESETS: { label: string; sizes: string[] }[] = [
  { label: "Clothing XS–XXL", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Waist 26–38", sizes: ["26", "28", "30", "32", "34", "36", "38"] },
  { label: "Footwear EU 36–44", sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"] },
  { label: "One size", sizes: ["One Size"] },
];

export function SizesEditor({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [custom, setCustom] = useState("");
  const add = (s: string) => {
    const v = s.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 border border-ink bg-ink py-1.5 pl-3 pr-1.5 text-[0.8125rem] text-paper">
            {s}
            <button type="button" aria-label={`Remove size ${s}`} onClick={() => onChange(value.filter((x) => x !== s))} className="grid size-5 place-items-center hover:bg-paper/20">
              <X className="size-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-[0.85rem] text-stone">No sizes yet.</span>}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SIZE_PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => onChange(p.sizes)} className="border border-line bg-paper-2 px-3 py-1.5 text-[0.75rem] transition-colors hover:border-ink">
            {p.label}
          </button>
        ))}
      </div>
      <form
        className="mt-4 flex max-w-xs gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add(custom);
          setCustom("");
        }}
      >
        <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom size, e.g. 3XL" aria-label="Add a custom size" />
        <Button type="submit" variant="outline" size="icon" aria-label="Add size">
          <Plus className="size-4" />
        </Button>
      </form>
      {error && <p role="alert" className="mt-2 text-[0.8125rem] text-danger">{error}</p>}
    </div>
  );
}

export function ColorsEditor({ value, onChange, error }: { value: ProductColor[]; onChange: (v: ProductColor[]) => void; error?: string }) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#8d8a82");
  const add = (c: ProductColor) => {
    if (!c.name.trim() || value.some((x) => x.name.toLowerCase() === c.name.trim().toLowerCase())) return;
    onChange([...value, { name: c.name.trim(), hex: c.hex }]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((c) => (
          <span key={c.name} className="inline-flex items-center gap-2 border border-line bg-paper-2 py-1.5 pl-2.5 pr-1.5 text-[0.8125rem]">
            <span className="size-4 rounded-full border border-ink/20" style={{ background: c.hex }} />
            {c.name}
            <button type="button" aria-label={`Remove colour ${c.name}`} onClick={() => onChange(value.filter((x) => x.name !== c.name))} className="grid size-5 place-items-center hover:bg-bone">
              <X className="size-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && <span className="text-[0.85rem] text-stone">No colours yet.</span>}
      </div>
      <p className="mb-2 mt-5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone">Quick add</p>
      <div className="flex max-w-xl flex-wrap gap-1.5">
        {Object.entries(COLOR_HEX)
          .slice(0, 36)
          .map(([n, h]) => (
            <button key={n} type="button" title={n} aria-label={`Add ${n}`} disabled={value.some((x) => x.name === n)} onClick={() => add({ name: n, hex: h })} className="size-7 rounded-full border border-ink/20 transition-transform hover:scale-110 disabled:opacity-25" style={{ background: h }} />
          ))}
      </div>
      <form
        className="mt-4 flex max-w-md items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add({ name, hex });
          setName("");
        }}
      >
        <label className="relative size-11 shrink-0 cursor-pointer overflow-hidden border border-line" aria-label="Pick a colour">
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="absolute -inset-2 size-16 cursor-pointer" />
        </label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Colour name, e.g. Midnight" aria-label="Colour name" />
        <Button type="submit" variant="outline" size="icon" aria-label="Add colour">
          <Plus className="size-4" />
        </Button>
      </form>
      {error && <p role="alert" className="mt-2 text-[0.8125rem] text-danger">{error}</p>}
    </div>
  );
}

export function VariantMatrix({ value, onChange, error }: { value: Variant[]; onChange: (v: Variant[]) => void; error?: string }) {
  const [bulk, setBulk] = useState("10");
  const set = (id: string, patch: Partial<Variant>) => onChange(value.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const total = value.reduce((s, v) => s + v.stock, 0);
  if (!value.length) return <p className="border border-dashed border-line px-4 py-6 text-center text-[0.85rem] text-stone">Add at least one colour and one size to generate variants.</p>;
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.85rem] text-graphite">
          {value.length} variants · <strong className="font-medium text-ink tabular-nums">{total}</strong> units in stock
        </p>
        <div className="flex items-center gap-2">
          <Input type="number" min={0} value={bulk} onChange={(e) => setBulk(e.target.value)} aria-label="Stock for all variants" className="h-9 w-24" />
          <Button type="button" size="sm" variant="outline" onClick={() => onChange(value.map((v) => ({ ...v, stock: Math.max(0, Math.floor(Number(bulk) || 0)) })))}>
            Set all
          </Button>
        </div>
      </div>
      <div className="thin-scroll max-h-96 overflow-auto border border-line">
        <table className="w-full min-w-[30rem] text-left text-[0.8125rem]">
          <thead className="sticky top-0 bg-bone">
            <tr className="text-[0.65rem] uppercase tracking-[0.12em] text-stone">
              <th className="px-3 py-2.5 font-medium">Colour</th>
              <th className="px-3 py-2.5 font-medium">Size</th>
              <th className="px-3 py-2.5 font-medium">SKU</th>
              <th className="px-3 py-2.5 text-right font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {value.map((v) => (
              <tr key={v.id} className="border-t border-line/70">
                <td className="px-3 py-1.5">{v.color}</td>
                <td className="px-3 py-1.5 tabular-nums">{v.size}</td>
                <td className="px-3 py-1.5">
                  <input value={v.sku} onChange={(e) => set(v.id, { sku: e.target.value })} aria-label={`SKU for ${v.color} ${v.size}`} className="w-full min-w-40 border border-transparent bg-transparent px-1.5 py-1.5 font-mono text-[0.75rem] outline-none hover:border-line focus:border-ink" />
                </td>
                <td className="px-3 py-1.5 text-right">
                  <input
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => set(v.id, { stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                    aria-label={`Stock for ${v.color} ${v.size}`}
                    className={cn("w-20 border border-line bg-paper px-2 py-1.5 text-right tabular-nums outline-none focus:border-ink", v.stock === 0 && "border-danger/50 bg-danger/[0.05]")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p role="alert" className="mt-2 text-[0.8125rem] text-danger">{error}</p>}
    </div>
  );
}
