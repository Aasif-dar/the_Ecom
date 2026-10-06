import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/social-icons";
import { FOOTER_LINKS } from "@/lib/nav";
import { BRAND } from "@/lib/brand";

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="eyebrow mb-6 font-sans text-paper/55">{title}</h3>
      <ul className="space-y-3.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-[0.9375rem] text-paper/85 transition-colors hover:text-paper">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper sm:mt-32">
      <div className="container-x pb-10 pt-16 sm:pt-20">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_2fr]">
          <div className="max-w-md">
            <Logo tone="light" />
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-paper/70">{BRAND.description}</p>
            <div className="mt-10">
              <p className="eyebrow mb-3 text-paper/55">Join the list</p>
              <p className="mb-2 font-serif text-[1.7rem] leading-tight">New edits, first.</p>
              <NewsletterForm tone="dark" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
            <Column title="Shop" links={FOOTER_LINKS.shop} />
            <Column title="Customer service" links={FOOTER_LINKS.service} />
            <div className="col-span-2 sm:col-span-1">
              <Column title="Company" links={FOOTER_LINKS.company} />
              <div className="mt-10">
                <h3 className="eyebrow mb-4 font-sans text-paper/55">Studio</h3>
                <address className="text-[0.875rem] not-italic leading-relaxed text-paper/75">
                  {BRAND.address}
                  <br />
                  <a href={`mailto:${BRAND.email}`} className="underline-offset-4 hover:underline">
                    {BRAND.email}
                  </a>
                  <br />
                  <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline">
                    {BRAND.phone}
                  </a>
                </address>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-paper/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-paper/55">
            © {new Date().getFullYear()} {BRAND.displayName}. Designed in Mumbai. This is a demo store, so no real payments are taken.
          </p>
          <div className="flex items-center gap-5 text-paper/75">
            <a href={`https://instagram.com/${BRAND.instagram}`} aria-label="Instagram" className="transition-colors hover:text-paper">
              <InstagramIcon />
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className="transition-colors hover:text-paper">
              <FacebookIcon />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="transition-colors hover:text-paper">
              <LinkedinIcon />
            </a>
            <span className="mx-1 hidden h-4 w-px bg-paper/20 sm:block" />
            <span className="hidden text-[0.8125rem] text-paper/55 sm:block">UPI · Cards · Net banking · COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
