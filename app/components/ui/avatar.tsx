"use client"

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "app/lib/utils"
import * as React from "react"

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & { size?: "default" | "sm" | "lg" }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "tw:size-8 tw:rounded-full tw:after:rounded-full tw:data-[size=lg]:size-10 tw:data-[size=sm]:size-6 tw:after:border-border tw:group/avatar tw:relative tw:flex tw:shrink-0 tw:select-none tw:after:absolute tw:after:inset-0 tw:after:border tw:after:mix-blend-darken tw:dark:after:mix-blend-lighten",
        className,
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "tw:rounded-full tw:aspect-square tw:size-full tw:object-cover",
        className,
      )}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "tw:bg-muted tw:text-muted-foreground tw:rounded-full tw:flex tw:size-full tw:items-center tw:justify-center tw:text-sm tw:group-data-[size=sm]/avatar:text-xs",
        className,
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "tw:bg-primary tw:text-primary-foreground tw:ring-background tw:absolute tw:right-0 tw:bottom-0 tw:z-10 tw:inline-flex tw:items-center tw:justify-center tw:rounded-full tw:bg-blend-color tw:ring-2 tw:select-none",
        "tw:group-data-[size=sm]/avatar:size-2 tw:group-data-[size=sm]/avatar:[&>svg]:hidden",
        "tw:group-data-[size=default]/avatar:size-2.5 tw:group-data-[size=default]/avatar:[&>svg]:size-2",
        "tw:group-data-[size=lg]/avatar:size-3 tw:group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "tw:*:data-[slot=avatar]:ring-background tw:group/avatar-group tw:flex tw:-space-x-2 tw:*:data-[slot=avatar]:ring-2",
        className,
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "tw:bg-muted tw:text-muted-foreground tw:size-8 tw:rounded-full tw:text-sm tw:group-has-data-[size=lg]/avatar-group:size-10 tw:group-has-data-[size=sm]/avatar-group:size-6 tw:[&>svg]:size-4 tw:group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 tw:group-has-data-[size=sm]/avatar-group:[&>svg]:size-3 tw:ring-background tw:relative tw:flex tw:shrink-0 tw:items-center tw:justify-center tw:ring-2",
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge }
