import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 border border-input bg-paper-2 px-3.5 text-[0.9375rem] text-ink transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone/70 hover:border-stone/60 focus-visible:border-ink focus-visible:ring-1 focus-visible:ring-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-bone disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
