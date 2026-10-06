"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, MapPin, Package, UserRound } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/social-icons";
import { NAV_LINKS } from "@/lib/nav";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui";
import { useCatalogStore } from "@/store/catalog";
import { useCurrentUser } from "@/store/hooks";

export function MobileMenu() {
  const open = useUiStore((s) => s.menuOpen);
  const setOpen = useUiStore((s) => s.setMenuOpen);
  const categories = useCatalogStore((s) => s.categories).filter((c) => c.status === "active");
  const user = useCurrentUser();
  const close = () => setOpen(false);
  const links = NAV_LINKS.filter((l) => !l.mega);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="!w-full overflow-y-auto sm:!max-w-md">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Site navigation</SheetDescription>
        <div className="flex h-16 shrink-0 items-center px-5">
          <Logo asLink={false} className="text-[1.5rem]" />
        </div>

        <nav aria-label="Main" className="px-5 pb-2">
          <ul className="divide-y divide-line border-y border-line">
            {links.map((l) => (
              <li key={l.label}>
                <Link href={l.href} onClick={close} className="group flex items-center justify-between py-4 font-serif text-[2.1rem] leading-none">
                  {l.label}
                  <ArrowUpRight className="size-5 text-stone transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.25} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="px-5 py-7" aria-labelledby="mm-cats">
          <h2 id="mm-cats" className="eyebrow mb-4 font-sans text-stone">
            Shop by category
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop/${c.slug}`} onClick={close} className="group relative block aspect-[4/5] overflow-hidden bg-bone">
                  <Image src={c.image} alt="" fill sizes="45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-3.5 font-serif text-[1.45rem] leading-none text-paper">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-line px-5 py-6">
          {user ? (
            <>
              <p className="eyebrow mb-1 font-sans text-stone">Signed in as</p>
              <p className="mb-4 font-serif text-[1.5rem] leading-tight">{user.name}</p>
              <ul className="grid grid-cols-2 gap-2 text-[0.875rem]">
                {[
                  { href: "/account", label: "Account", icon: UserRound },
                  { href: "/account/orders", label: "Orders", icon: Package },
                  { href: "/wishlist", label: "Wishlist", icon: Heart },
                  { href: "/account/addresses", label: "Addresses", icon: MapPin },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={close} className="flex items-center gap-2.5 border border-line bg-paper-2 px-3.5 py-3 hover:border-ink">
                      <l.icon className="size-4" strokeWidth={1.5} /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={close} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                Sign in
              </Link>
              <Link href="/register" onClick={close} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
                Register
              </Link>
            </div>
          )}
        </section>

        <div className="mt-auto flex items-center justify-between gap-4 bg-bone px-5 py-5 text-[0.8125rem] text-graphite">
          <div className="flex gap-5">
            <Link href="/track-order" onClick={close} className="underline underline-offset-4">
              Track order
            </Link>
            <Link href="/contact" onClick={close} className="underline underline-offset-4">
              Help
            </Link>
          </div>
          <a href={`https://instagram.com/${BRAND.instagram}`} className="inline-flex items-center gap-2">
            <InstagramIcon /> @{BRAND.instagram}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
