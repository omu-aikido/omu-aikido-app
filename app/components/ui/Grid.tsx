import React from "react"

interface GridProps {
  children: React.ReactNode
  className?: string
}

export const Grid: React.FC<GridProps> = ({ children, className = "" }) => {
  const gridClasses = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 ${className}`

  return (
    <div className={gridClasses} data-testid="grid-container">
      {children}
    </div>
  )
}

export default Grid
