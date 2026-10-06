import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  href,
  hrefLabel = "View all",
  align = "left",
  className,
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", align === "center" && "flex-col items-center text-center", className)}>
      <div>
        {eyebrow && <p className={cn("eyebrow mb-4", tone === "light" ? "text-paper/70" : "text-clay")}>{eyebrow}</p>}
        <h2 className={cn("display-md", tone === "light" ? "text-paper" : "text-ink")}>
          {title}
          {accent && <em className="ml-[0.25em] font-serif italic">{accent}</em>}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className={cn(
            "group inline-flex items-center gap-1.5 border-b pb-1 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors",
            tone === "light" ? "border-paper/50 text-paper hover:border-paper" : "border-ink/40 text-ink hover:border-ink",
          )}
        >
          {hrefLabel}
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
