import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex h-[1.4rem] w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap border border-transparent px-2 text-[0.625rem] font-medium uppercase tracking-[0.12em] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper",
        secondary: "bg-bone text-graphite",
        outline: "border-line text-graphite",
        clay: "bg-clay text-paper",
        success: "bg-success/12 text-success",
        warning: "bg-warning/14 text-warning",
        danger: "bg-danger/12 text-danger",
        info: "bg-moss/10 text-moss",
        progress: "bg-clay/12 text-clay",
        neutral: "bg-bone text-graphite",
        paper: "bg-paper text-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">({ className: cn(badgeVariants({ variant }), className) }, props),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
