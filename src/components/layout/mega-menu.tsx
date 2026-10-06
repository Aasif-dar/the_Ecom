"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCatalogStore } from "@/store/catalog";
import { COLLECTIONS } from "@/data/categories";

export function MegaMenuPanel({ onNavigate }: { onNavigate: () => void }) {
  const categories = useCatalogStore((s) => s.categories).filter((c) => c.status === "active");
  const feature = COLLECTIONS[0];

  return (
    <div className="border-t border-line bg-paper shadow-[0_30px_50px_-30px_rgba(20,17,15,0.25)]">
      <div className="container-x grid grid-cols-[1fr_320px] gap-12 py-10">
        <div className="grid grid-cols-4 gap-8">
          {categories.slice(0, 4).map((c) => (
            <div key={c.id}>
              <Link href={`/shop/${c.slug}`} onClick={onNavigate} className="group mb-5 inline-flex items-center gap-1.5 font-serif text-[1.6rem] leading-none hover:text-clay">
                {c.name}
                <ArrowUpRight className="size-4 opacity-0 transition-all group-hover:opacity-100" />
              </Link>
              <ul className="space-y-3">
                {c.subcategories
                  .filter((s) => s.status === "active")
                  .map((s) => (
                    <li key={s.id}>
                      <Link href={`/shop/${c.slug}?sub=${s.slug}`} onClick={onNavigate} className="text-[0.9rem] text-graphite transition-colors hover:text-clay">
                        {s.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href={`/collections/${feature.slug}`} onClick={onNavigate} className="group relative block overflow-hidden bg-bone">
          <div className="relative aspect-[4/3]">
            <Image src={feature.image} alt={feature.name} fill sizes="320px" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
            <p className="eyebrow mb-2 text-paper/80">Featured collection</p>
            <p className="font-serif text-[1.7rem] leading-none">{feature.name}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
