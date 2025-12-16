import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { cn } from "app/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("tw:flex tw:w-full tw:flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("tw:not-last:border-b", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="tw:flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "tw:focus-visible:ring-ring/50 tw:focus-visible:border-ring tw:focus-visible:after:border-ring tw:**:data-[slot=accordion-trigger-icon]:text-muted-foreground tw:rounded-md tw:py-4 tw:text-left tw:text-sm tw:font-medium tw:hover:underline tw:focus-visible:ring-[3px] tw:**:data-[slot=accordion-trigger-icon]:ml-auto tw:**:data-[slot=accordion-trigger-icon]:size-4 tw:group/accordion-trigger tw:relative tw:flex tw:flex-1 tw:items-start tw:justify-between tw:border tw:border-transparent tw:transition-all tw:outline-none tw:disabled:pointer-events-none tw:disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="tw:pointer-events-none tw:shrink-0 tw:group-aria-expanded/accordion-trigger:hidden"
        />
        <ChevronUpIcon
          data-slot="accordion-trigger-icon"
          className="tw:pointer-events-none tw:hidden tw:shrink-0 tw:group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="tw:data-open:animate-accordion-down tw:data-closed:animate-accordion-up tw:text-sm tw:overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          "tw:pt-0 tw:pb-4 tw:[&_a]:hover:text-foreground tw:h-(--accordion-panel-height) tw:data-ending-style:h-0 tw:data-starting-style:h-0 tw:[&_a]:underline tw:[&_a]:underline-offset-3 tw:[&_p:not(:last-child)]:mb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
