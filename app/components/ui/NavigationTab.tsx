import React from "react"
import { Link, useLocation } from "react-router-dom"

import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

export interface NavigationTabProp {
  to: string
  label: string
}

export const NavigationTab = React.memo<{ tabs?: NavigationTabProp[] }>(
  function NavigationTab({ tabs = [] }) {
    const location = useLocation()
    const activeTab = tabs.find(tab => location.pathname === tab.to)?.to || ""

    // タブの数に応じてクラス名をマッピング
    const gridColsMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
    }

    const gridColsClass = gridColsMap[tabs.length] || ""

    return (
      <Tabs value={activeTab} className="w-full">
        <TabsList className={`grid w-full ${gridColsClass}`}>
          {tabs.map(tab => (
            <TabsTrigger key={tab.to} value={tab.to}>
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
