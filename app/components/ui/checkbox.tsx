import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "app/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "tw:border-input tw:dark:bg-input/30 tw:data-checked:bg-primary tw:data-checked:text-primary-foreground tw:dark:data-checked:bg-primary tw:data-checked:border-primary tw:aria-invalid:aria-checked:border-primary tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:flex tw:size-4 tw:items-center tw:justify-center tw:rounded-[4px] tw:border tw:shadow-xs tw:transition-shadow tw:group-has-disabled/field:opacity-50 tw:focus-visible:ring-[3px] tw:aria-invalid:ring-[3px] tw:peer tw:relative tw:shrink-0 tw:outline-none tw:after:absolute tw:after:-inset-x-3 tw:after:-inset-y-2 tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="tw:[&>svg]:size-3.5 tw:grid tw:place-content-center tw:text-current tw:transition-none"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
