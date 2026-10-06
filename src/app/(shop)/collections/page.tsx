import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Reveal } from "@/components/ui/reveal";
import { COLLECTIONS } from "@/data/categories";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Collections",
  description: "Four edits for the way you live: the festive Utsav Edit, The Denim Edit, City Tailoring and Weekend Essentials.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <div className="container-x pb-4 pt-8 sm:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Collections" }]} className="mb-6" />
      <p className="eyebrow mb-3 text-clay">Curated</p>
      <h1 className="display-lg">
        Four edits, <em className="font-serif italic">one wardrobe.</em>
      </h1>
      <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-graphite">Each collection is a point of view: a small set of pieces designed to be worn together and for a long time.</p>

      <ul className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-2">
        {COLLECTIONS.map((c, i) => (
          <li key={c.id} className={cn(i % 2 === 1 && "md:mt-20")}>
            <Reveal>
              <Link href={`/collections/${c.slug}`} className="group block">
                <div className="relative aspect-[5/4] overflow-hidden bg-bone">
                  <Image src={c.image} alt={`${c.name} lookbook`} fill priority={i < 2} sizes="(min-width:768px) 48vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]" />
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow mb-2 text-stone">{String(i + 1).padStart(2, "0")} · {c.tagline}</p>
                    <h2 className="font-serif text-[2.4rem] leading-none sm:text-[3rem]">{c.name}</h2>
                    <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-graphite">{c.description}</p>
                  </div>
                  <span className="mt-1 grid size-11 shrink-0 place-items-center border border-ink transition-colors group-hover:bg-ink group-hover:text-paper">
                    <ArrowUpRight className="size-5" strokeWidth={1.25} />
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
