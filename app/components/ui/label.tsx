"use client"

import { cn } from "app/lib/utils"
import * as React from "react"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "tw:gap-2 tw:text-sm tw:leading-none tw:font-medium tw:group-data-[disabled=true]:opacity-50 tw:peer-disabled:opacity-50 tw:flex tw:items-center tw:select-none tw:group-data-[disabled=true]:pointer-events-none tw:peer-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
