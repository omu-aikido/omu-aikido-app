import { jaJP } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/react-router"
import { getAuth, rootAuthLoader } from "@clerk/react-router/ssr.server"
import { useState } from "react"
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
} from "react-router"

import type { Route } from "./+types/root"
import { AccountUi } from "./components/component/AccountUi"
import { Footer } from "./components/component/Footer"
import { ReactHeader } from "./components/component/Header"
import { Sidebar } from "./components/ui/Sidebar"
import { getProfile } from "./lib/query/profile"
import { Role } from "./lib/zod"
import "./styles/global.css"
import type { PagePath } from "./type"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId
  if (!new URL(args.request.url).pathname.startsWith("/sign-") && !userId)
    return redirect("/sign-in?redirect_url=" + args.request.url)
  let links: PagePath[]
  const env = args.context.cloudflare.env

  const profile = await getProfile({ userId, env })

  if (!profile) {
    links = [
      { name: "ログイン", href: "/sign-in", desc: "ログインページ" },
      { name: "アカウント作成", href: "/sign-up", desc: "アカウント作成ページ" },
    ]
  } else {
    links = [
      { name: "ホーム", href: "/", desc: "ダッシュボード" },
      { name: "記録", href: "/record", desc: "活動の記録をつけよう" },
      { name: "アカウント", href: "/account", desc: "アカウント設定" },
    ]

    const isAdmin = Role.fromString(profile.role)?.isManagement()

    if (isAdmin) {
      links.push({ name: "管理者", href: "/admin", desc: "管理者ページ" })
    }
  }

  return rootAuthLoader(
    args,
    () => {
      return { links }
    },
    {
      secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
      publishableKey: args.context.cloudflare.env.CLERK_PUBLISHABLE_KEY,
    },
  )
}

export default function App(args: Route.ComponentProps) {
  const loaderData = args.loaderData
  const { links } = loaderData
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <html lang="ja">
      <ClerkProvider loaderData={loaderData} localization={jaJP}>
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
            <Sidebar
              position="right"
              icon={"  ≡  "}
              open={sidebarOpen}
              onOpenChange={setSidebarOpen}
            >
              <AccountUi apps={links} />
            </Sidebar>
          </ReactHeader>
          <main className="min-h-4/5 p-3 md:p-6 mx-auto max-w-3xl overflow-y-auto mb-auto">
            <Outlet />
          </main>
          <ScrollRestoration />
          <Scripts />
          <Footer />
        </body>
      </ClerkProvider>
    </html>
  )
}
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  let message = "エラーが発生しました"
  let details = "予期しないエラーが発生しました。"
  let stack: string | undefined
  let status: number = 503

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - ページが見つかりません" : "エラー"
    details =
      error.status === 404
        ? "お探しのページは存在しないか、移動された可能性があります。"
        : error.statusText || details
    status = error.status
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="大阪公立大学合氣道部 活動管理アプリ" />
        <link rel="sitemap" href="/sitemap-index.xml" />
        <link rel="canonical" href="https://app.omu-aikido.com" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>エラー - ハム大合気ポータル</title>
        <Meta />
        <Links />
      </head>
      <body className="h-dvh bg-gray-100 text-gray-800">
        <ReactHeader title="ポータル">
          <Sidebar
            position="right"
            icon={"  ≡  "}
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
          >
            <p>メニューは利用できません</p>
          </Sidebar>
        </ReactHeader>
        <main className="min-h-4/5 p-6 mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-400 mb-4">
            {message}
          </h1>
          {status === 404 && <img src="/404 NotFound.png" />}
          {status === 500 && <img src="/500 InternalServerError.png" />}
          <p className="text-lg mb-6 text-slate-600 dark:text-slate-500">{details}</p>
          {stack && (
            <pre className="bg-gray-200 p-4 rounded text-left overflow-x-auto">
              <code>{stack}</code>
            </pre>
          )}
          <a
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ホームに戻る
          </a>
        </main>
        <ScrollRestoration />
        <Scripts />
        <Footer />
      </body>
    </html>
  )
}
