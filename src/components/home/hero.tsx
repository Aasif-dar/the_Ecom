"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteStore } from "@/store/site";

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};
const reveal: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", scale: 1.06 },
  show: { clipPath: "inset(0 0 0% 0)", scale: 1, transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  const hero = useSiteStore((s) => s.content.hero);

  return (
    <section aria-label="Featured collection" className="relative isolate overflow-hidden bg-paper">
      <div className="container-x lg:grid lg:h-[min(calc(100svh-7.5rem),52rem)] lg:min-h-[40rem] lg:grid-cols-12 lg:gap-6 lg:py-8">
        {/* imagery: full-bleed on mobile, two staggered portraits on desktop */}
        <div className="absolute inset-0 lg:relative lg:inset-auto lg:col-span-7 lg:col-start-6 lg:flex lg:gap-5">
          <motion.div variants={reveal} initial="hidden" animate="show" className="relative h-full w-full bg-bone lg:w-[58%]">
            <Image src={hero.imageMain} alt="A woman in an ivory zari anarkali set from the festive edit, standing in a jewellery showroom" fill priority sizes="(min-width:1024px) 36vw, 100vw" className="object-cover object-[50%_20%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/10 lg:hidden" aria-hidden />
          </motion.div>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="relative hidden w-[38%] self-end bg-bone lg:block lg:h-[78%]"
          >
            <Image src={hero.imageSide} alt="A man in a hand-embroidered mint chikankari kurta" fill sizes="22vw" className="object-cover" />
            <span className="absolute -left-px bottom-6 bg-paper px-3.5 py-2 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink">Chikankari, Lucknow</span>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 flex min-h-[max(34rem,calc(100svh-6.5rem))] flex-col justify-end pb-10 pt-24 text-paper lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:min-h-0 lg:justify-center lg:pb-0 lg:pr-6 lg:pt-0 lg:text-ink"
        >
          <motion.p variants={rise} className="eyebrow mb-6 inline-flex w-fit items-center gap-2.5 border border-paper/50 px-3 py-2 lg:border-ink/30">
            <span className="size-1.5 rounded-full bg-clay" aria-hidden /> {hero.eyebrow}
          </motion.p>
          <h1 className="text-[clamp(3.1rem,13vw,4.6rem)] leading-[0.94] tracking-[-0.025em] lg:text-[clamp(3.4rem,5.4vw,6rem)]">
            <span className="block overflow-hidden pb-1">
              <motion.span variants={rise} className="block">
                {hero.title}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.em variants={rise} className="block font-serif italic">
                {hero.titleAccent}
              </motion.em>
            </span>
          </h1>
          <motion.p variants={rise} className="mt-6 max-w-md text-[1rem] leading-relaxed text-paper/85 lg:text-graphite">
            {hero.body}
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={hero.primaryCta.href} className={cn(buttonVariants({ size: "lg" }), "bg-paper text-ink hover:bg-white lg:bg-ink lg:text-paper lg:hover:bg-graphite")}>
              {hero.primaryCta.label} <ArrowRight className="size-4" />
            </Link>
            <Link href={hero.secondaryCta.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-paper/80 text-paper hover:bg-paper hover:text-ink lg:border-ink lg:text-ink lg:hover:bg-ink lg:hover:text-paper")}>
              {hero.secondaryCta.label}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
