import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cn } from "app/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const toggleVariants = cva(
  "tw:hover:text-foreground tw:aria-pressed:bg-muted tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:gap-1 tw:rounded-md tw:text-sm tw:font-medium tw:transition-[color,box-shadow] tw:[&_svg:not([class*=size-])]:size-4 tw:group/toggle tw:hover:bg-muted tw:inline-flex tw:items-center tw:justify-center tw:whitespace-nowrap tw:outline-none tw:focus-visible:ring-[3px] tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "tw:bg-transparent",
        outline:
          "tw:border-input tw:hover:bg-muted tw:border tw:bg-transparent tw:shadow-xs",
      },
      size: {
        default: "tw:h-9 tw:min-w-9 tw:px-2",
        sm: "tw:h-8 tw:min-w-8 tw:px-1.5",
        lg: "tw:h-10 tw:min-w-10 tw:px-2.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
