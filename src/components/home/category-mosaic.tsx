"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

const TILES = [
  { label: "Women", note: "Dresses, ethnic & tailoring", href: "/shop/women", image: "/images/editorial/cat-women.jpg", alt: "Woman in a patchwork check overcoat on an autumn street" },
  { label: "Men", note: "Kurtas, shirts & blazers", href: "/shop/men", image: "/images/editorial/cat-men.jpg", alt: "Man seated in a camel blazer and white tee" },
  { label: "Accessories", note: "Bags, eyewear & jewellery", href: "/shop/accessories", image: "/images/editorial/cat-accessories.jpg", alt: "Woman holding a tan crossbody bag" },
  { label: "New Arrivals", note: "Just landed this month", href: "/shop/new-arrivals", image: "/images/editorial/cat-new.jpg", alt: "A rail of jackets, knits and a denim jacket" },
  { label: "Best Sellers", note: "What everyone is buying", href: "/shop/best-sellers", image: "/images/editorial/cat-best.jpg", alt: "Woman in a Banarasi silk saree" },
];

export function CategoryMosaic() {
  return (
    <section aria-labelledby="cats-title" className="container-x pt-20 sm:pt-28">
      <Reveal>
        <SectionHeading eyebrow="Browse" title="Shop by" accent="category" href="/shop" hrefLabel="All products" className="mb-10 sm:mb-14" />
      </Reveal>
      <h2 id="cats-title" className="sr-only">
        Featured categories
      </h2>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-5">
        {TILES.map((t, i) => (
          <li
            key={t.label}
            className={cn(
              "w-[64vw] max-w-[18rem] shrink-0 snap-start md:w-auto md:max-w-none",
              // desktop: stagger the baseline for an editorial rhythm
              "md:col-span-2 lg:col-span-1",
              i % 2 === 1 && "lg:mt-14",
              i === 3 && "md:col-start-2 lg:col-start-auto",
            )}
          >
            <Reveal delay={i * 0.07} y={30}>
              <Link href={t.href} className="group block">
                <div className="relative aspect-[3/4.2] overflow-hidden bg-bone">
                  <Image src={t.image} alt={t.alt} fill sizes="(min-width:1024px) 20vw, (min-width:768px) 32vw, 64vw" className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                  <span className="absolute right-3 top-3 grid size-9 -translate-y-1 place-items-center bg-paper text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-[1.75rem] leading-none">{t.label}</h3>
                  <span className="hidden text-right text-[0.78rem] leading-tight text-stone xl:block">{t.note}</span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
