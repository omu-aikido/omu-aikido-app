import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "app/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "tw:bg-border tw:shrink-0 tw:data-[orientation=horizontal]:h-px tw:data-[orientation=horizontal]:w-full tw:data-[orientation=vertical]:w-px tw:data-[orientation=vertical]:self-stretch",
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
