import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "app/lib/utils"
import * as React from "react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "tw:dark:bg-input/30 tw:border-input tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:h-9 tw:rounded-md tw:border tw:bg-transparent tw:px-2.5 tw:py-1 tw:text-base tw:shadow-xs tw:transition-[color,box-shadow] tw:file:h-7 tw:file:text-sm tw:file:font-medium tw:focus-visible:ring-[3px] tw:aria-invalid:ring-[3px] tw:md:text-sm tw:file:text-foreground tw:placeholder:text-muted-foreground tw:w-full tw:min-w-0 tw:outline-none tw:file:inline-flex tw:file:border-0 tw:file:bg-transparent tw:disabled:pointer-events-none tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
