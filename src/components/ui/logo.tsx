"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useSiteStore } from "@/store/site";

export function Logo({ className, tone = "dark", asLink = true }: { className?: string; tone?: "dark" | "light"; asLink?: boolean }) {
  // the wordmark is editable by the admin under Settings → General
  const text = useSiteStore((s) => s.settings.general.logoText) || BRAND.name;
  const mark = (
    <span
      className={cn(
        "inline-flex items-baseline font-serif text-[1.7rem] leading-none tracking-[0.32em] sm:text-[1.9rem]",
        tone === "light" ? "text-paper" : "text-ink",
        className,
      )}
    >
      {text}
    </span>
  );
  if (!asLink) return mark;
  return (
    <Link href="/" aria-label={`${BRAND.displayName} home`} className="inline-block outline-offset-4">
      {mark}
    </Link>
  );
}
