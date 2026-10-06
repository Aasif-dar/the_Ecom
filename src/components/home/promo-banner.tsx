"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { useSiteStore } from "@/store/site";

export function PromoBanner() {
  const promo = useSiteStore((s) => s.content.promo);
  if (!promo.active) return null;
  return (
    <section aria-label="Promotion" className="relative mt-20 overflow-hidden bg-ink sm:mt-28">
      <div className="relative min-h-[30rem] sm:min-h-[36rem]">
        <Image src={promo.image} alt="A rail of warm wool knits and cardigans" fill sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/10" aria-hidden />
        <div className="container-x relative z-10 flex min-h-[30rem] items-center py-16 sm:min-h-[36rem]">
          <Reveal className="max-w-xl text-paper">
            <p className="eyebrow mb-6 text-paper/80">{promo.eyebrow}</p>
            <h2 className="display-xl !text-[clamp(3.4rem,9vw,7rem)] leading-[0.92]">
              {promo.title.split(" ").slice(0, -1).join(" ")} <em className="font-serif italic">{promo.title.split(" ").slice(-1)}</em>
            </h2>
            <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-paper/85">{promo.body}</p>
            <Link href={promo.cta.href} className={cn(buttonVariants({ variant: "light", size: "lg" }), "mt-9")}>
              {promo.cta.label} <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
