import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Address", "Review", "Payment", "Confirmation"];

export function CheckoutStepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4" aria-current={current ? "step" : undefined}>
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-[0.7rem] font-medium tabular-nums transition-colors",
                  done && "border-ink bg-ink text-paper",
                  current && "border-ink bg-paper text-ink ring-2 ring-ink ring-offset-2 ring-offset-paper",
                  !done && !current && "border-sand text-stone",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={2.5} /> : n}
              </span>
              <span className={cn("text-[0.72rem] font-medium uppercase tracking-[0.14em]", current ? "inline text-ink" : "hidden text-stone sm:inline")}>{label}</span>
            </span>
            {i < STEPS.length - 1 && <span aria-hidden className={cn("h-px w-5 sm:w-12", done ? "bg-ink" : "bg-sand")} />}
          </li>
        );
      })}
    </ol>
  );
}
