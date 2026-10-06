"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none after:absolute after:-inset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink data-checked:bg-ink data-unchecked:bg-sand data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[1.15rem] rounded-full bg-paper-2 shadow-sm ring-0 transition-transform data-checked:translate-x-[1.35rem] data-unchecked:translate-x-[0.2rem]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
