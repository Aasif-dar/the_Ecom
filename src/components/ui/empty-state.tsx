import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** An arched frame (a nod to doorways and jharokhas) holding a thin-line icon. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  actions,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center text-center", compact ? "py-10" : "py-16 sm:py-24", className)}>
      <div className="relative mb-7 grid h-32 w-24 place-items-center rounded-t-full bg-bone">
        <div className="absolute inset-2 rounded-t-full border border-sand" aria-hidden />
        <Icon className="relative size-9 text-graphite" strokeWidth={1} aria-hidden />
      </div>
      <h2 className="font-serif text-[2rem] leading-none text-ink">{title}</h2>
      {body && <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">{body}</p>}
      {actions && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </div>
  );
}
