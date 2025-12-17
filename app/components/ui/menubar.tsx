import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu"
import { cn } from "app/lib/utils"
import { CheckIcon } from "lucide-react"
import * as React from "react"

function Menubar({ className, ...props }: MenubarPrimitive.Props) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn(
        "tw:bg-background tw:h-9 tw:gap-1 tw:rounded-md tw:border tw:p-1 tw:shadow-xs tw:flex tw:items-center",
        className,
      )}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        "tw:hover:bg-muted tw:aria-expanded:bg-muted tw:rounded-sm tw:px-2 tw:py-1 tw:text-sm tw:font-medium tw:flex tw:items-center tw:outline-hidden tw:select-none",
        className,
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "tw:bg-popover tw:text-popover-foreground tw:data-open:animate-in tw:data-open:fade-in-0 tw:data-open:zoom-in-95 tw:data-[side=bottom]:slide-in-from-top-2 tw:data-[side=left]:slide-in-from-right-2 tw:data-[side=right]:slide-in-from-left-2 tw:data-[side=top]:slide-in-from-bottom-2 tw:ring-foreground/10 tw:min-w-36 tw:rounded-md tw:p-1 tw:shadow-md tw:ring-1 tw:duration-100 tw:",
        className,
      )}
      {...props}
    />
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "tw:focus:bg-accent tw:focus:text-accent-foreground tw:data-[variant=destructive]:text-destructive tw:data-[variant=destructive]:focus:bg-destructive/10 tw:dark:data-[variant=destructive]:focus:bg-destructive/20 tw:data-[variant=destructive]:focus:text-destructive tw:data-[variant=destructive]:*:[svg]:!text-destructive tw:not-data-[variant=destructive]:focus:**:text-accent-foreground tw:gap-2 tw:rounded-sm tw:px-2 tw:py-1.5 tw:text-sm tw:data-[disabled]:opacity-50 tw:data-[inset]:pl-8 tw:[&_svg:not([class*=size-])]:size-4 tw:group/menubar-item",
        className,
      )}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "tw:focus:bg-accent tw:focus:text-accent-foreground tw:focus:**:text-accent-foreground tw:gap-2 tw:rounded-md tw:py-1.5 tw:pr-2 tw:pl-8 tw:text-sm tw:data-disabled:opacity-50 tw:relative tw:flex tw:cursor-default tw:items-center tw:outline-hidden tw:select-none tw:data-disabled:pointer-events-none tw:data-disabled:opacity-50 tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="tw:left-2 tw:size-4 tw:[&_svg:not([class*=size-])]:size-4 tw:pointer-events-none tw:absolute tw:flex tw:items-center tw:justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "tw:focus:bg-accent tw:focus:text-accent-foreground tw:focus:**:text-accent-foreground tw:gap-2 tw:rounded-md tw:py-1.5 tw:pr-2 tw:pl-8 tw:text-sm tw:data-disabled:opacity-50 tw:[&_svg:not([class*=size-])]:size-4 tw:relative tw:flex tw:cursor-default tw:items-center tw:outline-hidden tw:select-none tw:data-disabled:pointer-events-none tw:[&_svg]:pointer-events-none tw:[&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      <span className="tw:left-2 tw:size-4 tw:[&_svg:not([class*=size-])]:size-4 tw:pointer-events-none tw:absolute tw:flex tw:items-center tw:justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel>) {
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "tw:px-2 tw:py-1.5 tw:text-sm tw:font-medium tw:data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      data-slot="menubar-separator"
      className={cn("tw:bg-border tw:-mx-1 tw:my-1 tw:h-px", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={cn(
        "tw:text-muted-foreground tw:group-focus/menubar-item:text-accent-foreground tw:text-xs tw:tracking-widest tw:ml-auto",
        className,
      )}
      {...props}
    />
  )
}

function MenubarSub({ ...props }: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & { inset?: boolean }) {
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "tw:focus:bg-accent tw:focus:text-accent-foreground tw:data-open:bg-accent tw:data-open:text-accent-foreground tw:gap-2 tw:rounded-sm tw:px-2 tw:py-1.5 tw:text-sm tw:data-[inset]:pl-8 tw:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      className={cn(
        "tw:bg-popover tw:text-popover-foreground tw:data-open:animate-in tw:data-closed:animate-out tw:data-closed:fade-out-0 tw:data-open:fade-in-0 tw:data-closed:zoom-out-95 tw:data-open:zoom-in-95 tw:data-[side=bottom]:slide-in-from-top-2 tw:data-[side=left]:slide-in-from-right-2 tw:data-[side=right]:slide-in-from-left-2 tw:data-[side=top]:slide-in-from-bottom-2 tw:ring-foreground/10 tw:min-w-32 tw:rounded-md tw:p-1 tw:shadow-lg tw:ring-1 tw:duration-100",
        className,
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
