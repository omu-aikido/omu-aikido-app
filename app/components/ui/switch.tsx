"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "app/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & { size?: "sm" | "default" }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "tw:data-checked:bg-primary tw:data-unchecked:bg-input tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:dark:data-unchecked:bg-input/80 tw:shrink-0 tw:rounded-full tw:border tw:border-transparent tw:shadow-xs tw:focus-visible:ring-[3px] tw:aria-invalid:ring-[3px] tw:data-[size=default]:h-[18.4px] tw:data-[size=default]:w-[32px] tw:data-[size=sm]:h-[14px] tw:data-[size=sm]:w-[24px] tw:peer tw:group/switch tw:relative tw:inline-flex tw:items-center tw:transition-all tw:outline-none tw:after:absolute tw:after:-inset-x-3 tw:after:-inset-y-2 tw:data-disabled:cursor-not-allowed tw:data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="tw:bg-background tw:dark:data-unchecked:bg-foreground tw:dark:data-checked:bg-primary-foreground tw:rounded-full tw:group-data-[size=default]/switch:size-4 tw:group-data-[size=sm]/switch:size-3 tw:group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] tw:group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] tw:group-data-[size=default]/switch:data-unchecked:translate-x-0 tw:group-data-[size=sm]/switch:data-unchecked:translate-x-0 tw:pointer-events-none tw:block tw:ring-0 tw:transition-transform"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
