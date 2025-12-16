import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "app/lib/utils"
import { CircleIcon } from "lucide-react"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("tw:grid tw:gap-3 tw:w-full", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "tw:border-input tw:text-primary tw:dark:bg-input/30 tw:focus-visible:border-ring tw:focus-visible:ring-ring/50 tw:aria-invalid:ring-destructive/20 tw:dark:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:dark:aria-invalid:border-destructive/50 tw:flex tw:size-4 tw:rounded-full tw:shadow-xs tw:focus-visible:ring-[3px] tw:aria-invalid:ring-[3px] tw:group/radio-group-item tw:peer tw:relative tw:aspect-square tw:shrink-0 tw:border tw:outline-none tw:after:absolute tw:after:-inset-x-3 tw:after:-inset-y-2 tw:disabled:cursor-not-allowed tw:disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="tw:group-aria-invalid/radio-group-item:text-destructive tw:text-primary tw:flex tw:size-4 tw:items-center tw:justify-center"
      >
        <CircleIcon className="tw:absolute tw:top-1/2 tw:left-1/2 tw:size-2 tw:-translate-x-1/2 tw:-translate-y-1/2 tw:fill-current" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
