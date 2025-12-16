import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { Separator } from "app/components/ui/separator"
import { cn } from "app/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonGroupVariants = cva(
  "tw:has-[>[data-slot=button-group]]:gap-2 tw:has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md tw:flex tw:w-fit tw:items-stretch tw:[&>*]:focus-visible:z-10 tw:[&>*]:focus-visible:relative tw:[&>[data-slot=select-trigger]:not([class*=w-])]:w-fit tw:[&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "tw:[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md! tw:[&>[data-slot]~[data-slot]]:rounded-l-none tw:[&>[data-slot]~[data-slot]]:border-l-0 tw:[&>[data-slot]]:rounded-r-none",
        vertical:
          "tw:[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-md! tw:flex-col tw:[&>[data-slot]~[data-slot]]:rounded-t-none tw:[&>[data-slot]~[data-slot]]:border-t-0 tw:[&>[data-slot]]:rounded-b-none",
      },
    },
    defaultVariants: { orientation: "horizontal" },
  },
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "bg-muted gap-2 rounded-md border px-2.5 text-sm font-medium shadow-xs [&_svg:not([class*='size-'])]:size-4 flex items-center [&_svg]:pointer-events-none",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "button-group-text" },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "tw:bg-input tw:relative tw:self-stretch tw:data-[orientation=horizontal]:mx-px tw:data-[orientation=horizontal]:w-auto tw:data-[orientation=vertical]:my-px tw:data-[orientation=vertical]:h-auto",
        className,
      )}
      {...props}
    />
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
