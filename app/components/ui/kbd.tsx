import { cn } from "app/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "tw:bg-muted tw:text-muted-foreground tw:[[data-slot=tooltip-content]_&]:bg-background/20 tw:[[data-slot=tooltip-content]_&]:text-background tw:dark:[[data-slot=tooltip-content]_&]:bg-background/10 tw:h-5 tw:w-fit tw:min-w-5 tw:gap-1 tw:rounded-sm tw:px-1 tw:font-sans tw:text-xs tw:font-medium tw:[&_svg:not([class*=size-])]:size-3 tw:pointer-events-none tw:inline-flex tw:items-center tw:justify-center tw:select-none",
        className,
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("tw:gap-1 tw:inline-flex tw:items-center", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
