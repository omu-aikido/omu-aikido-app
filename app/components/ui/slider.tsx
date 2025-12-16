"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "app/lib/utils"
import * as React from "react"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      className="tw:data-horizontal:w-full tw:data-vertical:h-full"
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className={cn(
          "tw:data-vertical:min-h-40 tw:relative tw:flex tw:w-full tw:touch-none tw:items-center tw:select-none tw:data-disabled:opacity-50 tw:data-vertical:h-full tw:data-vertical:w-auto tw:data-vertical:flex-col",
          className,
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="tw:bg-muted tw:rounded-full tw:data-horizontal:h-1.5 tw:data-horizontal:w-full tw:data-vertical:h-full tw:data-vertical:w-1.5 tw:relative tw:overflow-hidden tw:select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="tw:bg-primary tw:select-none tw:data-horizontal:h-full tw:data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="tw:border-primary tw:ring-ring/50 tw:size-4 tw:rounded-full tw:border tw:bg-white tw:shadow-sm tw:transition-[color,box-shadow] tw:hover:ring-4 tw:focus-visible:ring-4 tw:focus-visible:outline-hidden tw:block tw:shrink-0 tw:select-none tw:disabled:pointer-events-none tw:disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
