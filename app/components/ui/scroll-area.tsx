import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "app/lib/utils"
import * as React from "react"

function ScrollArea({ className, children, ...props }: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("tw:relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="tw:focus-visible:ring-ring/50 tw:size-full tw:rounded-[inherit] tw:transition-[color,box-shadow] tw:outline-none tw:focus-visible:ring-[3px] tw:focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "tw:data-horizontal:h-2.5 tw:data-horizontal:flex-col tw:data-horizontal:border-t tw:data-horizontal:border-t-transparent tw:data-vertical:h-full tw:data-vertical:w-2.5 tw:data-vertical:border-l tw:data-vertical:border-l-transparent tw:flex tw:touch-none tw:p-px tw:transition-colors tw:select-none",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="tw:rounded-full tw:bg-border tw:relative tw:flex-1"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
