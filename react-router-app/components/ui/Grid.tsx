import React from "react"

interface GridProps {
  variant?: "offset" | "small"
  children: React.ReactNode
  className?: string
}

export const Grid: React.FC<GridProps> = ({ variant, children, className = "" }) => {
  const baseClasses = "grid grid-rows-[repeat(auto,1fr)] gap-4 list-none p-0"

  const variantClasses = {
    small:
      "grid-cols-2 gap-6 md:flex md:flex-wrap md:justify-center md:gap-8 [&>*]:md:basis-80 [&>:last-child:nth-child(odd)]:col-span-2 md:[&>:last-child:nth-child(odd)]:col-span-1",
    offset:
      "md:grid-cols-2 md:gap-8 md:pb-0.5 [&>:nth-child(odd)]:md:translate-y-0.5 [&>:last-child:nth-child(odd)]:md:col-start-1 [&>:last-child:nth-child(odd)]:md:transform-none",
  }

  // Default responsive behavior for all grids
  const responsiveClasses = "md:grid-cols-2 md:gap-8"

  const gridClasses = [
    baseClasses,
    !variant && responsiveClasses,
    variant && variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={gridClasses}>{children}</div>
}

export default Grid
