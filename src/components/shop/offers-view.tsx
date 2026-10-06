"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatINR } from "@/lib/format";
import { useSiteStore } from "@/store/site";

function CopyCode({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
        } catch {
          /* clipboard unavailable: the toast still confirms the code */
        }
        setDone(true);
        toast.success(`${code} copied`, { description: "Paste it at checkout." });
        setTimeout(() => setDone(false), 2000);
      }}
      className="group inline-flex items-center gap-3 border border-dashed border-ink px-4 py-3 font-mono text-[0.95rem] font-medium tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper"
      aria-label={`Copy code ${code}`}
    >
      {code}
      {done ? <Check className="size-4" /> : <Copy className="size-4 opacity-60 group-hover:opacity-100" />}
    </button>
  );
}

export function OffersView() {
  const offers = useSiteStore((s) => s.content.offers).filter((o) => o.active);
  const coupons = useSiteStore((s) => s.coupons).filter((c) => c.active && new Date(c.expiresAt).getTime() > Date.now());

  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Offers" }]} className="mb-6" />
      <p className="eyebrow mb-3 text-clay">Offers</p>
      <h1 className="display-lg">
        A little <em className="font-serif italic">extra.</em>
      </h1>
      <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-graphite">Current codes and sale edits. Codes can be applied in your bag or at checkout.</p>

      <ul className="mt-12 border-t border-ink">
        {offers.map((o, i) => (
          <li key={o.id} className="border-b border-line">
            <Reveal delay={i * 0.05} y={14}>
              <div className="grid items-center gap-6 py-8 md:grid-cols-[12rem_1fr_auto] md:gap-10 md:py-10">
                <div>
                  <Badge variant="clay">{o.badge}</Badge>
                </div>
                <div>
                  <h2 className="font-serif text-[2rem] leading-none sm:text-[2.6rem]">{o.title}</h2>
                  <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-graphite">{o.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 md:justify-end">
                  {o.code && <CopyCode code={o.code} />}
                  <Link href={o.href} className="inline-flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:text-clay">
                    Shop now <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <section className="mt-20" aria-labelledby="terms-h">
        <h2 id="terms-h" className="font-serif text-[2rem] leading-none">
          Code details
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-[0.9rem]">
            <thead>
              <tr className="border-b border-ink text-[0.6875rem] uppercase tracking-[0.14em] text-stone">
                <th className="py-3 pr-4 font-medium">Code</th>
                <th className="py-3 pr-4 font-medium">Benefit</th>
                <th className="py-3 pr-4 font-medium">Minimum order</th>
                <th className="py-3 font-medium">Valid until</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code} className="border-b border-line">
                  <td className="py-4 pr-4 font-mono font-medium tracking-[0.12em]">{c.code}</td>
                  <td className="py-4 pr-4 text-graphite">{c.description}</td>
                  <td className="py-4 pr-4 tabular-nums">{formatINR(c.minOrder)}</td>
                  <td className="py-4 tabular-nums text-graphite">{formatDate(c.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
