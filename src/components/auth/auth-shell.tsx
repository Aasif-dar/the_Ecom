import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

/** Split-screen frame shared by sign-in, register and password reset. */
export function AuthShell({
  eyebrow,
  title,
  accent,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100dvh-2.25rem)] lg:grid-cols-[1fr_1fr]">
      <div className="relative hidden bg-ink lg:block">
        <Image src="/images/editorial/auth.jpg" alt="A woman in a hand-woven silk saree against a red backdrop" fill priority sizes="50vw" className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-paper">
          <p className="eyebrow mb-4 text-paper/75">Since 2019</p>
          <p className="max-w-md font-serif text-[2.6rem] leading-[1.02]">
            Clothes to be bought rarely and <em className="italic">worn constantly.</em>
          </p>
        </div>
        <div className="absolute left-12 top-10">
          <Logo tone="light" />
        </div>
      </div>

      <div className="flex flex-col px-5 py-10 sm:px-10 lg:px-16 xl:px-24">
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>
        <div className="m-auto w-full max-w-md py-4">
          <p className="eyebrow mb-4 text-clay">{eyebrow}</p>
          <h1 className="display-md">
            {title} {accent && <em className="font-serif italic">{accent}</em>}
          </h1>
          {subtitle && <p className="mt-4 text-[0.9375rem] leading-relaxed text-graphite">{subtitle}</p>}
          <div className="mt-9">{children}</div>
          {footer && <div className="mt-8 border-t border-line pt-6 text-[0.875rem] text-graphite">{footer}</div>}
        </div>
        <p className="mt-auto pt-8 text-center text-[0.75rem] text-stone">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            Back to the store
          </Link>
        </p>
      </div>
    </div>
  );
}
