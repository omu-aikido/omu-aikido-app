"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "app/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"
import * as React from "react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("tw:scroll-my-1 tw:p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("tw:flex tw:flex-1 tw:text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { size?: "sm" | "default" }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "tw:border-input tw:data-[placeholder]:text-muted-foreground tw:dark:bg-input/30 tw:dark:hover:bg-input/50 tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:gap-1.5 tw:rounded-md tw:border tw:bg-transparent tw:py-2 tw:pr-2 tw:pl-2.5 tw:text-sm tw:shadow-xs tw:transition-[color,box-shadow] tw:focus-visible:ring-[3px] tw:aria-invalid:ring-[3px] tw:data-[size=default]:h-9 tw:data-[size=sm]:h-8 tw:*:data-[slot=select-value]:flex tw:*:data-[slot=select-value]:gap-1.5 tw:[&_svg:not([class*=size-])]:size-4 tw:flex tw:w-fit tw:items-center tw:justify-between tw:whitespace-nowrap tw:outline-none tw:disabled:cursor-not-allowed tw:disabled:opacity-50 tw:*:data-[slot=select-value]:line-clamp-1 tw:*:data-[slot=select-value]:flex tw:*:data-[slot=select-value]:items-center tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="tw:text-muted-foreground tw:size-4 tw:pointer-events-none" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="tw:isolate tw:z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "tw:bg-popover tw:text-popover-foreground tw:data-open:animate-in tw:data-closed:animate-out tw:data-closed:fade-out-0 tw:data-open:fade-in-0 tw:data-closed:zoom-out-95 tw:data-open:zoom-in-95 tw:data-[side=bottom]:slide-in-from-top-2 tw:data-[side=left]:slide-in-from-right-2 tw:data-[side=right]:slide-in-from-left-2 tw:data-[side=top]:slide-in-from-bottom-2 tw:ring-foreground/10 tw:min-w-36 tw:rounded-md tw:shadow-md tw:ring-1 tw:duration-100 tw: tw:relative tw:isolate tw:z-50 tw:max-h-(--available-height) tw:w-(--anchor-width) tw:origin-(--transform-origin) tw:overflow-x-hidden tw:overflow-y-auto",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("tw:text-muted-foreground tw:px-2 tw:py-1.5 tw:text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "tw:focus:bg-accent tw:focus:text-accent-foreground tw:not-data-[variant=destructive]:focus:**:text-accent-foreground tw:gap-2 tw:rounded-sm tw:py-1.5 tw:pr-8 tw:pl-2 tw:text-sm tw:[&_svg:not([class*=size-])]:size-4 tw:*:[span]:last:flex tw:*:[span]:last:items-center tw:*:[span]:last:gap-2 tw:relative tw:flex tw:w-full tw:cursor-default tw:items-center tw:outline-hidden tw:select-none tw:data-[disabled]:pointer-events-none tw:data-[disabled]:opacity-50 tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="tw:flex tw:flex-1 tw:gap-2 tw:shrink-0 tw:whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="tw:pointer-events-none tw:absolute tw:right-2 tw:flex tw:size-4 tw:items-center tw:justify-center" />
        }
      >
        <CheckIcon className="tw:pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "tw:bg-border tw:-mx-1 tw:my-1 tw:h-px tw:pointer-events-none",
        className,
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "tw:bg-popover tw:z-10 tw:flex tw:cursor-default tw:items-center tw:justify-center tw:py-1 tw:[&_svg:not([class*=size-])]:size-4 tw:top-0 tw:w-full",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "tw:bg-popover tw:z-10 tw:flex tw:cursor-default tw:items-center tw:justify-center tw:py-1 tw:[&_svg:not([class*=size-])]:size-4 tw:bottom-0 tw:w-full",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
