import { cn } from "app/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("tw:bg-muted tw:rounded-md tw:animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
