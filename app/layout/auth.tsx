import { getAuth } from "@clerk/react-router/server"
import { useState } from "react"
import { Outlet, redirect } from "react-router"

import type { Route } from "./+types/auth"

import { AccountUi } from "@/app/components/component/AccountUi"
import { Footer } from "@/app/components/component/Footer"
import { ReactHeader } from "@/app/components/component/Header"
import { Button } from "@/app/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet"
import { getProfile } from "@/app/lib/query/profile"
import { Role } from "@/app/lib/role"
import "@/app/styles/global.css"
import type { PagePath } from "@/app/type"

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
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="mx-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg p-2 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              ≡
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-4">
            <SheetHeader>
              <SheetTitle>メニュー</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <AccountUi apps={links} />
            </div>
          </SheetContent>
        </Sheet>
      </ReactHeader>
      <main
        className="mx-auto mt-20 mb-auto min-h-4/5 max-w-3xl overflow-y-auto p-3 md:p-6"
        data-testid="auth-layout-main"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
