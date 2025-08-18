import { getAuth } from "@clerk/react-router/ssr.server"
import { useState } from "react"
import { Outlet, redirect } from "react-router"

import type { Route } from "./+types/auth"

import { AccountUi } from "~/components/component/AccountUi"
import { Footer } from "~/components/component/Footer"
import { ReactHeader } from "~/components/component/Header"
import { Sidebar } from "~/components/ui/Sidebar"
import { getProfile } from "~/lib/query/profile"
import { Role } from "~/lib/zod"
import "~/styles/global.css"
import type { PagePath } from "~/type"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
]

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId
  const env = args.context.cloudflare.env

  const profile = await getProfile({ userId, env })

  if (!profile)
    return redirect("/sign-in" + `?redirect_url=${encodeURIComponent(args.request.url)}`)

  const links: PagePath[] = [
    { name: "ホーム", href: "/", desc: "ダッシュボード" },
    { name: "記録", href: "/record", desc: "活動の記録をつけよう" },
    { name: "アカウント", href: "/account", desc: "アカウント設定" },
  ]

  const isAdmin = Role.fromString(profile.role)?.isManagement()

  if (isAdmin) {
    links.push({ name: "管理者", href: "/admin", desc: "管理者ページ" })
  }
  return { links }
}

export default function App(args: Route.ComponentProps) {
  const loaderData = args.loaderData
  const { links } = loaderData
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-dvh" data-testid="auth-layout-container">
      <ReactHeader title="ポータル">
        <Sidebar
          position="right"
          icon={"  ≡  "}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        >
          <AccountUi apps={links} />
        </Sidebar>
      </ReactHeader>
      <main
        className="min-h-4/5 p-3 md:p-6 mt-20 mx-auto max-w-3xl overflow-y-auto mb-auto"
        data-testid="auth-layout-main"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
