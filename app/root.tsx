import { ClerkProvider } from "@clerk/react-router"
import { rootAuthLoader } from "@clerk/react-router/server"
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"

import type { Route } from "./+types/root"

import { Footer } from "~/components/component/Footer"
import { ReactHeader } from "~/components/component/Header"
import { Toaster } from "~/components/ui/sonner"
import "~/styles/global.css"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
]

export const loader = (args: Route.LoaderArgs) =>
  rootAuthLoader(args, {
    secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
    publishableKey: args.context.cloudflare.env.CLERK_PUBLISHABLE_KEY,
  })

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <html lang="ja">
      <ClerkProvider loaderData={loaderData}>
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
          <Toaster position="top-right" />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </body>
      </ClerkProvider>
    </html>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "エラーが発生しました"
  let details = "予期しないエラーが発生しました。"
  let status: number = 503
  let is404 = false

  if (isRouteErrorResponse(error)) {
    status = error.status
    is404 = status === 404
    message = is404 ? "ページが見つかりません" : "エラーが発生しました"
    details = is404
      ? "お探しのページは存在しないか、移動された可能性があります。"
      : "一時的な問題が発生している可能性があります。"
  }

  const handleReload = () => {
    window.location.reload()
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
      <body className="h-dvh bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <ReactHeader title="ポータル">
          <></>
        </ReactHeader>
        <main className="min-h-4/5 p-6 mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 mt-20">
            {message}
          </h1>
          {is404 && <img src="/404 NotFound.png" alt="404エラー" />}
          {!is404 && <img src="/500 InternalServerError.png" alt="サーバーエラー" />}
          <p className="text-lg mb-6 text-slate-600 dark:text-slate-300">{details}</p>
          <div className="space-y-4">
            {is404 ? (
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
              >
                ホームに戻る
              </Link>
            ) : (
              <>
                <button
                  onClick={handleReload}
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition mr-4"
                >
                  ページを再読み込み
                </button>
                <Link
                  to="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
                >
                  ホームに戻る
                </Link>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                  問題が解決しない場合は、管理者にお問い合わせください。
                </p>
              </>
            )}
          </div>
        </main>
        <ScrollRestoration />
        <Scripts />
        <Footer />
      </body>
    </html>
  )
}
