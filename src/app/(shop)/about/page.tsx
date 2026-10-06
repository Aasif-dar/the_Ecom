import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our story",
  description: "Aadyam is a Mumbai studio making considered clothing, footwear and accessories in small runs with partner workshops across India.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { n: "01", t: "Make less, properly", d: "We release a few pieces at a time and make them in small runs, so nothing is made to be marked down." },
  { n: "02", t: "Honest fabric", d: "Cotton mulmul, handloom, full-grain leather and wool. We show you what each piece is made of, and where." },
  { n: "03", t: "Workshops, not factories", d: "Fourteen partner workshops in Lucknow, Jaipur, Tiruppur, Agra and Varanasi, paid fairly and on time." },
  { n: "04", t: "Built to be mended", d: "Every garment ships with spare buttons and thread. Write to us and we'll repair what we sold you." },
];

export default function AboutPage() {
  return (
    <div className="pb-4">
      <div className="container-x pt-8 sm:pt-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Our story" }]} className="mb-8" />
        <p className="eyebrow mb-4 text-clay">The story</p>
        <h1 className="display-xl max-w-4xl">
          Clothes to be bought rarely, <em className="font-serif italic">worn constantly.</em>
        </h1>
      </div>

      <div className="container-x mt-14 grid gap-12 lg:grid-cols-12">
        <Reveal className="relative aspect-[4/5] overflow-hidden bg-bone lg:col-span-5">
          <Image src="/images/editorial/story-main.jpg" alt="A clothing rail in the Aadyam studio" fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-end gap-6 text-[1.0625rem] leading-[1.8] text-graphite lg:col-span-6 lg:col-start-7">
          <p className="font-serif text-[1.9rem] leading-[1.15] text-ink">
            Aadyam is Sanskrit for <em className="italic">first</em>, the first thing you reach for.
          </p>
          <p>
            We started in 2019 in a small studio in Bandra, frustrated by wardrobes full of clothes that never quite became favourites. We wanted garments with the ease of something you've owned for years on day one: soft cottons, clean cuts, colours that go together.
          </p>
          <p>
            Today we design in Mumbai and make with fourteen workshops across India. Chikankari from Lucknow, block prints from Jaipur, jersey from Tiruppur, leather from Agra and Kanpur. Each piece is cut in small runs and sold at honest prices, because we skip the seasonal discounting game.
          </p>
          <p>{BRAND.displayName} is not a trend. It's a point of view about how to dress, and how much to own.</p>
        </Reveal>
      </div>

      <section className="mt-24 bg-bone py-20 sm:mt-32 sm:py-28" aria-labelledby="values-h">
        <div className="container-x">
          <h2 id="values-h" className="display-md mb-14">
            What we <em className="font-serif italic">believe</em>
          </h2>
          <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <li key={v.n} className="border-t border-ink pt-5">
                <p className="font-sans text-[0.75rem] tabular-nums text-stone">{v.n}</p>
                <h3 className="mt-4 font-serif text-[1.8rem] leading-[1.05]">{v.t}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-graphite">{v.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container-x mt-20 flex flex-col items-center gap-6 text-center">
        <p className="display-md max-w-2xl">
          Come and see what we've been <em className="font-serif italic">making.</em>
        </p>
        <Link href="/shop" className={buttonVariants({ size: "lg" })}>
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
