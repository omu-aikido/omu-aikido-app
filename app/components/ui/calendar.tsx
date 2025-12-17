"use client"

import { Button, buttonVariants } from "app/components/ui/button"
import { cn } from "app/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import * as React from "react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "tw:p-3 tw:[--cell-radius:var(--radius-md)] tw:[--cell-size:--spacing(8)] tw:bg-background tw:group/calendar tw:[[data-slot=card-content]_&]:bg-transparent tw:[[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: date => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("tw:w-fit", defaultClassNames.root),
        months: cn(
          "tw:flex tw:gap-4 tw:flex-col tw:md:flex-row tw:relative",
          defaultClassNames.months,
        ),
        month: cn("tw:flex tw:flex-col tw:w-full tw:gap-4", defaultClassNames.month),
        nav: cn(
          "tw:flex tw:items-center tw:gap-1 tw:w-full tw:absolute tw:top-0 tw:inset-x-0 tw:justify-between",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "tw:size-(--cell-size) tw:aria-disabled:opacity-50 tw:p-0 tw:select-none",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "tw:size-(--cell-size) tw:aria-disabled:opacity-50 tw:p-0 tw:select-none",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "tw:flex tw:items-center tw:justify-center tw:h-(--cell-size) tw:w-full tw:px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "tw:w-full tw:flex tw:items-center tw:text-sm tw:font-medium tw:justify-center tw:h-(--cell-size) tw:gap-1.5",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "tw:relative tw:cn-calendar-dropdown-root tw:rounded-(--cell-radius)",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          "tw:absolute tw:bg-popover tw:inset-0 tw:opacity-0",
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          "tw:select-none tw:font-medium",
          captionLayout === "label"
            ? "tw:text-sm"
            : "tw:cn-calendar-caption-label tw:rounded-(--cell-radius) tw:flex tw:items-center tw:gap-1 tw:text-sm tw: tw:[&>svg]:text-muted-foreground tw:[&>svg]:size-3.5",
          defaultClassNames.caption_label,
        ),
        table: "tw:w-full tw:border-collapse",
        weekdays: cn("tw:flex", defaultClassNames.weekdays),
        weekday: cn(
          "tw:text-muted-foreground tw:rounded-(--cell-radius) tw:flex-1 tw:font-normal tw:text-[0.8rem] tw:select-none",
          defaultClassNames.weekday,
        ),
        week: cn("tw:flex tw:w-full tw:mt-2", defaultClassNames.week),
        week_number_header: cn(
          "tw:select-none tw:w-(--cell-size)",
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          "tw:text-[0.8rem] tw:select-none tw:text-muted-foreground",
          defaultClassNames.week_number,
        ),
        day: cn(
          "tw:relative tw:w-full tw:rounded-(--cell-radius) tw:h-full tw:p-0 tw:text-center tw:[&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) tw:group/day tw:aspect-square tw:select-none",
          props.showWeekNumber
            ? "tw:[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "tw:[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day,
        ),
        range_start: cn(
          "tw:rounded-l-(--cell-radius) tw:bg-muted tw:elative tw:after:bg-muted tw:after:absolute tw:after:inset-y-0 tw:after:w-4 tw:after:right-0 tw:-z-0 tw:isolate",
          defaultClassNames.range_start,
        ),
        range_middle: cn("tw:rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "tw:rounded-r-(--cell-radius) tw:bg-muted tw:relative tw:after:bg-muted tw:after:absolute tw:after:inset-y-0 tw:after:w-4 tw:after:left-0 tw:-z-0 tw:isolate",
          defaultClassNames.range_end,
        ),
        today: cn(
          "tw:bg-muted tw:text-foreground tw:rounded-(--cell-radius) tw:data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn(
          "tw:text-muted-foreground tw:aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "tw:text-muted-foreground tw:opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("tw:invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("tw:size-4", className)} {...props} />
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("tw:size-4", className)} {...props} />
          }

          return <ChevronDownIcon className={cn("tw:size-4", className)} {...props} />
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="tw:flex tw:size-(--cell-size) tw:items-center tw:justify-center tw:text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "tw:data-[selected-single=true]:bg-primary tw:data-[selected-single=true]:text-primary-foreground tw:data-[range-middle=true]:bg-muted tw:data-[range-middle=true]:text-foreground tw:data-[range-start=true]:bg-primary tw:data-[range-start=true]:text-primary-foreground tw:data-[range-end=true]:bg-primary tw:data-[range-end=true]:text-primary-foreground tw:group-data-[focused=true]/day:border-ring tw:group-data-[focused=true]/day:ring-ring/50 tw:dark:hover:text-foreground tw:relative tw:isolate tw:z-10 tw:flex tw:aspect-square tw:size-auto tw:w-full tw:min-w-(--cell-size) tw:flex-col tw:gap-1 tw:border-0 tw:leading-none tw:font-normal tw:group-data-[focused=true]/day:relative tw:group-data-[focused=true]/day:z-10 tw:group-data-[focused=true]/day:ring-[3px] tw:data-[range-end=true]:rounded-(--cell-radius) tw:data-[range-end=true]:rounded-r-(--cell-radius) tw:data-[range-middle=true]:rounded-none tw:data-[range-start=true]:rounded-(--cell-radius) tw:data-[range-start=true]:rounded-l-(--cell-radius) tw:[&>span]:text-xs tw:[&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
