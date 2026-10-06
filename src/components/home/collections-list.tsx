"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { COLLECTIONS } from "@/data/categories";
import { cn } from "@/lib/utils";

/**
 * Typographic index of the season's edits. On desktop the image beside the list
 * follows the hovered / focused row; on mobile each row carries its own thumbnail.
 */
export function CollectionsList() {
  const [active, setActive] = useState(0);
  return (
    <section aria-labelledby="edits-title" className="container-x pt-20 sm:pt-28">
      <Reveal>
        <SectionHeading eyebrow="Curated" title="Shop the" accent="edits" href="/collections" hrefLabel="All collections" className="mb-10 sm:mb-14" />
      </Reveal>
      <h2 id="edits-title" className="sr-only">
        Collections
      </h2>
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <ol className="border-t border-ink">
          {COLLECTIONS.map((c, i) => (
            <li key={c.id} className="border-b border-line">
              <Link
                href={`/collections/${c.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex items-center gap-4 py-6 sm:gap-8 sm:py-8"
              >
                <span className="w-7 shrink-0 font-sans text-[0.75rem] tabular-nums text-stone sm:w-10">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-serif text-[2.1rem] leading-none transition-[transform,color] duration-500 sm:text-[3.2rem]", active === i ? "text-ink lg:translate-x-2" : "text-ink lg:text-ink/45")}>{c.name}</p>
                  <p className="mt-2.5 text-[0.875rem] text-stone sm:mt-3 sm:text-[0.9375rem]">{c.tagline}</p>
                </div>
                <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-bone sm:h-24 sm:w-20 lg:hidden">
                  <Image src={c.image} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <ArrowUpRight className={cn("hidden size-6 shrink-0 transition-all duration-500 lg:block", active === i ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0")} strokeWidth={1.25} />
              </Link>
            </li>
          ))}
        </ol>
        <div className="relative hidden aspect-[4/5] self-start overflow-hidden bg-bone lg:block" aria-hidden>
          {COLLECTIONS.map((c, i) => (
            <Image
              key={c.id}
              src={c.image}
              alt=""
              fill
              sizes="40vw"
              className={cn("object-cover transition-all duration-[900ms] ease-out", active === i ? "scale-100 opacity-100" : "scale-[1.06] opacity-0")}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-6 pt-20 text-paper">
            <p className="eyebrow mb-2 text-paper/75">{String(active + 1).padStart(2, "0")} / {String(COLLECTIONS.length).padStart(2, "0")}</p>
            <p className="max-w-sm text-[0.9375rem] leading-relaxed">{COLLECTIONS[active].description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
