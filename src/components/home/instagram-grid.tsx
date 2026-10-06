import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { InstagramIcon } from "@/components/ui/social-icons";
import { BRAND } from "@/lib/brand";

const POSTS = [
  { n: 1, alt: "Mint chikankari kurta in the garden" },
  { n: 2, alt: "Croc-embossed crossbody in tan" },
  { n: 3, alt: "Double monk strap shoes in brown" },
  { n: 4, alt: "Camel blazer styled with a white tee" },
  { n: 5, alt: "Patchwork check overcoat in autumn light" },
  { n: 6, alt: "Structured top-handle bag in stone" },
  { n: 7, alt: "Tortoise round sunglasses by the water" },
  { n: 8, alt: "Heavyweight hoodie in heather grey" },
];

export function InstagramGrid() {
  return (
    <section aria-labelledby="ig-title" className="pt-20 sm:pt-28">
      <div className="container-x">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14">
          <div>
            <p className="eyebrow mb-4 text-clay">Social</p>
            <h2 id="ig-title" className="display-md">
              Follow our journey <em className="font-serif italic">@{BRAND.instagram}</em>
            </h2>
          </div>
          <a
            href={`https://instagram.com/${BRAND.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-b border-ink/40 pb-1 text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:border-ink"
          >
            <InstagramIcon /> Follow on Instagram
          </a>
        </Reveal>
      </div>
      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-1.5 lg:grid-cols-8">
        {POSTS.map((p) => (
          <li key={p.n}>
            <a href={`https://instagram.com/${BRAND.instagram}`} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden bg-bone" aria-label={`${p.alt} on Instagram`}>
              <Image src={`/images/editorial/ig-${p.n}.jpg`} alt={p.alt} fill sizes="(min-width:1024px) 12.5vw, (min-width:640px) 25vw, 50vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
              <span className="absolute inset-0 grid place-items-center bg-ink/45 text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <InstagramIcon width={26} height={26} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
