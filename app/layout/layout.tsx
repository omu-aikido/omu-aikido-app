import { useAuth, useUser } from "@clerk/react-router"
import { useEffect, useState } from "react"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router"

import { AccountUi } from "~/components/component/AccountUi"
import { Footer } from "~/components/component/Footer"
import { ReactHeader } from "~/components/component/Header"
import { Sidebar } from "~/components/ui/Sidebar"
import { Role } from "~/lib/zod"
import type { PagePath } from "~/type"

export function AppContent() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [textLinks, setTextLinks] = useState<PagePath[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const role = user?.publicMetadata?.role as string
    const isAdmin = Role.fromString(role)?.isManagement()

    const links: PagePath[] = isSignedIn
      ? [
          { name: "ホーム", href: "/", desc: "ダッシュボード" },
          { name: "記録", href: "/record", desc: "活動の記録をつけよう" },
          { name: "アカウント", href: "/account", desc: "アカウント設定" },
        ]
      : [
          { name: "ログイン", href: "/sign-in", desc: "ログインページ" },
          { name: "アカウント作成", href: "/sign-up", desc: "アカウント作成ページ" },
        ]

    if (isAdmin) {
      links.push({ name: "管理者", href: "/admin", desc: "管理者ページ" })
    }

    setTextLinks(links)
  }, [isSignedIn, user?.publicMetadata?.role])
  return (
    <>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="大阪公立大学合氣道部 活動管理アプリ" />
        <link rel="sitemap" href="/sitemap-index.xml" />
        <link rel="canonical" href="https://app.omu-aikido.com" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>ハム大合気ポータル</title>
        <Meta />
        <Links />
      </head>
      <body className="h-dvh">
        <ReactHeader title="ポータル">
          <Sidebar position="right" icon={"  ≡  "} open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <AccountUi apps={textLinks} />
          </Sidebar>
        </ReactHeader>
        <main className="min-h-4/5 p-3 md:p-6 mx-auto max-w-5xl overflow-y-auto mb-auto">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <Footer />
      </body>
    </>
  )
}
