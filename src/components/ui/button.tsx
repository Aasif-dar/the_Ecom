import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap border border-transparent font-medium uppercase tracking-[0.14em] outline-none transition-[background-color,color,border-color,opacity,transform] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 active:not-aria-[haspopup]:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-graphite",
        accent: "bg-clay text-paper hover:bg-clay-dark",
        outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
        secondary: "bg-bone text-ink hover:bg-sand",
        ghost: "text-ink hover:bg-bone",
        light: "bg-paper text-ink hover:bg-white",
        "outline-light": "border-paper/70 bg-transparent text-paper hover:bg-paper hover:text-ink",
        destructive: "border-danger/50 bg-transparent text-danger hover:bg-danger hover:text-paper",
        link: "h-auto border-0 p-0 normal-case tracking-normal text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink",
      },
      size: {
        default: "h-11 px-6 text-[0.6875rem]",
        xs: "h-7 gap-1 px-2.5 text-[0.625rem]",
        sm: "h-9 px-4 text-[0.65rem]",
        lg: "h-[3.4rem] px-9 text-[0.72rem]",
        icon: "size-10 p-0",
        "icon-xs": "size-7 p-0",
        "icon-sm": "size-9 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
