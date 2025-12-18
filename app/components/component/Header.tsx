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
      <header
        className="fixed top-0 z-50 m-0 flex h-20 w-full items-center justify-between bg-slate-200/70 px-6 py-0 text-slate-900 select-none dark:bg-slate-800/90 dark:text-slate-200"
        data-testid="header-container"
      >
        <h2
          className="items-center-safe justify-items-center md:w-1/6"
          data-testid="header-title-container"
        >
          <Link
            to="/"
            className="text-2xl font-bold text-slate-800 dark:text-slate-200"
            data-testid="header-link-home"
          >
            {title.slice(0, 8)}
          </Link>
        </h2>
        {children}
      </header>
      <div
        className="fixed top-0 left-0 z-10 h-20 w-full backdrop-blur-md"
        data-testid="header-backdrop"
      />
    </>
  )
})
