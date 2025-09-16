import React from "react"
import { Link, useLocation } from "react-router-dom"

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"

export type NavigationTabProp = { to: string; label: string }

export const NavigationTab = React.memo<{ tabs?: NavigationTabProp[] }>(
  function NavigationTab({ tabs = [] }) {
    const location = useLocation()
    const activeTab = tabs.find(tab => location.pathname === tab.to)?.to || ""

    return (
      <Tabs value={activeTab} className="w-full">
        <TabsList
          className={`grid w-full grid-cols-${
            {
              1: "grid-cols-1",
              2: "grid-cols-2",
              3: "grid-cols-3",
              4: "grid-cols-4",
              5: "grid-cols-5",
              6: "grid-cols-6",
              7: "grid-cols-7",
              8: "grid-cols-8",
            }[tabs.length] || "grid-cols-1"
          }`}
        >
          {tabs.map(tab => (
            <TabsTrigger key={tab.to} value={tab.to} asChild>
              <Link
                to={tab.to}
                data-testid={`navigation-tab-link-${tab.to.replace(/\//g, "-")}`}
              >
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    )
  },
)
