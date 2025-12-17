import { cn } from "app/lib/utils"
import * as React from "react"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "tw:ring-foreground/10 tw:bg-card tw:text-card-foreground tw:gap-6 tw:overflow-hidden tw:rounded-xl tw:py-6 tw:text-sm tw:shadow-xs tw:ring-1 tw:has-[>img:first-child]:pt-0 tw:data-[size=sm]:gap-4 tw:data-[size=sm]:py-4 tw:*:[img:first-child]:rounded-t-xl tw:*:[img:last-child]:rounded-b-xl tw:group/card tw:flex tw:flex-col",
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "tw:gap-1 tw:rounded-t-xl tw:px-6 tw:group-data-[size=sm]/card:px-4 tw:[.border-b]:pb-6 tw:group-data-[size=sm]/card:[.border-b]:pb-4 tw:group/card-header tw:@container/card-header tw:grid tw:auto-rows-min tw:items-start tw:has-data-[slot=card-action]:grid-cols-[1fr_auto] tw:has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "tw:text-base tw:leading-normal tw:font-medium tw:group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("tw:text-muted-foreground tw:text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "tw:col-start-2 tw:row-span-2 tw:row-start-1 tw:self-start tw:justify-self-end",
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("tw:px-6 tw:group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "tw:rounded-b-xl tw:px-6 tw:group-data-[size=sm]/card:px-4 tw:[.border-t]:pt-6 tw:group-data-[size=sm]/card:[.border-t]:pt-4 tw:flex tw:items-center",
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
