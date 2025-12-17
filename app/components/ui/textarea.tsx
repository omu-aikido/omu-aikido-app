import { cn } from "app/lib/utils"
import * as React from "react"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "tw:border-input tw:dark:bg-input/30 tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:rounded-md tw:border tw:bg-transparent tw:px-2.5 tw:py-2 tw:text-base tw:shadow-xs tw:transition-[color,box-shadow] tw:focus-visible:ring-[3px] tw:aria-invalid:ring-[3px] tw:md:text-sm tw:placeholder:text-muted-foreground tw:flex tw:field-sizing-content tw:min-h-16 tw:w-full tw:outline-none tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
