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
        <TabsList className={`grid w-full grid-cols-${tabs.length}`}>
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
