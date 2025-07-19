import { Link, useLocation } from "react-router-dom"
import { tv } from "tailwind-variants"

const style = {
  navigationTab: {
    tab: tv({
      base: "block whitespace-nowrap cursor-pointer py-2 px-4 font-medium transition-colors duration-300 border-b-2",
      variants: {
        isActive: {
          true: "text-slate-700 dark:text-gray-200 border-blue-500 dark:border-blue-600 bg-slate-200 dark:bg-slate-700 font-bold",
          false:
            "text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-500 dark:hover:text-gray-400 hover:border-gray-200 dark:hover:border-gray-500",
        },
      },
    }),
  },
}

export type NavigationTabProp = {
  to: string
  label: string
}

export function NavigationTab({ tabs = [] }: { tabs?: NavigationTabProp[] }) {
  const location = useLocation()
  return (
    <nav
      className="flex overflow-x-auto w-full mb-4 justify-start border-b border-slate-300 dark:border-slate-700"
      role="tablist"
      aria-label="タブナビゲーション"
    >
      {tabs.map((tab, idx) => {
        const isActive = location.pathname === tab.to
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={style.navigationTab.tab({ isActive })}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${idx}`}
            data-tab-index={idx}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
