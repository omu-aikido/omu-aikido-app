import { cn } from "app/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const alertVariants = cva(
  "tw:grid tw:gap-0.5 tw:rounded-lg tw:border tw:px-4 tw:py-3 tw:text-left tw:text-sm tw:has-data-[slot=alert-action]:relative tw:has-data-[slot=alert-action]:pr-18 tw:has-[>svg]:grid-cols-[auto_1fr] tw:has-[>svg]:gap-x-2.5 tw:*:[svg]:row-span-2 tw:*:[svg]:translate-y-0.5 tw:*:[svg]:text-current tw:*:[svg:not([class*=size-])]:size-4 tw:w-full tw:relative tw:group/alert",
  {
    variants: {
      variant: {
        default: "tw:bg-card tw:text-card-foreground",
        destructive:
          "tw:text-destructive tw:bg-card tw:*:data-[slot=alert-description]:text-destructive/90 tw:*:[svg]:text-current",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "tw:font-medium tw:group-has-[>svg]/alert:col-start-2 tw:[&_a]:hover:text-foreground tw:[&_a]:underline tw:[&_a]:underline-offset-3",
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "tw:text-muted-foreground tw:text-sm tw:text-balance tw:md:text-pretty tw:[&_p:not(:last-child)]:mb-4 tw:[&_a]:hover:text-foreground tw:[&_a]:underline tw:[&_a]:underline-offset-3",
        className,
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("tw:absolute tw:top-2.5 tw:right-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
