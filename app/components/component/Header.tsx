import React from "react"
import { Link } from "react-router"

interface AuthedHeaderProps {
  title: string
  children: React.ReactNode
}

export const ReactHeader = React.memo<AuthedHeaderProps>(function ReactHeader({
  title,
  children,
}) {
  return (
    <>
      <header className="m-0 py-0 px-6 top-0 z-50 sticky select-none bg-slate-200/70 dark:bg-slate-800/90 text-slate-900 dark:text-slate-200 flex justify-between items-center h-20">
        <h2 className="items-center-safe justify-items-center md:w-1/6">
          <Link to="/" className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            {title.slice(0, 8)}
          </Link>
        </h2>
        {children}
      </header>
      <div className="backdrop-blur-md fixed top-0 left-0 w-full h-20 z-10" />
    </>
  )
})
