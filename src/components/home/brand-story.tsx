import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function BrandStory() {
  return (
    <section aria-labelledby="story-title" className="container-x pt-20 sm:pt-28">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative lg:col-span-6">
          <div className="relative ml-0 aspect-[4/5] w-[86%] overflow-hidden bg-bone">
            <Image src="/images/editorial/story-main.jpg" alt="A clothing rail with a leather jacket, camel coat, knit and denim jacket" fill sizes="(min-width:1024px) 40vw, 80vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-8 right-0 aspect-[4/5] w-[46%] overflow-hidden border-[10px] border-paper bg-bone sm:-bottom-12">
            <Image src="/images/editorial/story-side.jpg" alt="White blouses and shirts on a wooden hanger rail" fill sizes="25vw" className="object-cover" />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
          <p className="eyebrow mb-5 text-clay">The story</p>
          <h2 id="story-title" className="display-lg">
            Designed with <em className="font-serif italic">intention.</em>
          </h2>
          <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75] text-graphite">
            <p>
              Aadyam began in 2019 as a small studio in Bandra with one stubborn idea: clothes should be bought rarely and worn constantly. So we make fewer things, and we make them properly.
            </p>
            <p>
              Every piece is cut in small runs with partner workshops in Lucknow, Jaipur, Tiruppur and Agra, using fabrics we have touched ourselves. No logos, no seasonal churn. Just honest garments for the way India actually lives.
            </p>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
            {[
              ["14", "partner workshops"],
              ["100%", "made in India"],
              ["7-day", "easy returns"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-serif text-[2.4rem] leading-none text-ink">{n}</dt>
                <dd className="mt-2 text-[0.8125rem] leading-snug text-stone">{l}</dd>
              </div>
            ))}
          </dl>
          <Link href="/about" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-10")}>
            Read our story <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
      <div className="h-8 sm:h-12" aria-hidden />
    </section>
  );
}
