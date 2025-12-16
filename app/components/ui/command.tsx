"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog"
import { InputGroup, InputGroupAddon } from "app/components/ui/input-group"
import { cn } from "app/lib/utils"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon, CheckIcon } from "lucide-react"
import * as React from "react"

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "tw:bg-popover tw:text-popover-foreground tw:rounded-xl! tw:p-1 tw:flex tw:size-full tw:flex-col tw:overflow-hidden",
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="tw:sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("tw:rounded-xl! tw:overflow-hidden tw:p-0", className)}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="tw:p-1 tw:pb-0">
      <InputGroup className="tw:bg-input/30 tw:border-input/30 tw:h-8! tw:rounded-lg! tw:shadow-none! tw:*:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "tw:w-full tw:text-sm tw:outline-hidden tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="tw:size-4 tw:shrink-0 tw:opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "tw:no-scrollbar tw:max-h-72 tw:scroll-py-1 tw:outline-none tw:overflow-x-hidden tw:overflow-y-auto",
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("tw:py-6 tw:text-center tw:text-sm", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "tw:text-foreground tw:[&_[cmdk-group-heading]]:text-muted-foreground tw:overflow-hidden tw:p-1 tw:[&_[cmdk-group-heading]]:px-2 tw:[&_[cmdk-group-heading]]:py-1.5 tw:[&_[cmdk-group-heading]]:text-xs tw:[&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("tw:bg-border tw:-mx-1 tw:h-px tw:w-auto", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "tw:data-selected:bg-muted tw:data-selected:text-foreground tw:data-selected:**:[svg]:text-foreground tw:relative tw:flex tw:cursor-default tw:items-center tw:gap-2 tw:rounded-sm tw:px-2 tw:py-1.5 tw:text-sm tw:outline-hidden tw:select-none tw:[&_svg:not([class*=size-])]:size-4 tw:[[data-slot=dialog-content]_&]:rounded-lg! tw:group/command-item tw:data-[disabled=true]:pointer-events-none tw:data-[disabled=true]:opacity-50 tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <CheckIcon className="tw:ml-auto tw:opacity-0 tw:group-has-[[data-slot=command-shortcut]]/command-item:hidden tw:group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "tw:text-muted-foreground tw:group-data-selected/command-item:text-foreground tw:ml-auto tw:text-xs tw:tracking-widest",
        className,
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
