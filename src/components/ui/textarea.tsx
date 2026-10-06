import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full border border-input bg-paper-2 px-3.5 py-3 text-[0.9375rem] leading-relaxed text-ink transition-colors outline-none placeholder:text-stone/70 hover:border-stone/60 focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:bg-bone disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
