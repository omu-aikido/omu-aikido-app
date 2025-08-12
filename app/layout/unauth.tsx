import { getAuth } from "@clerk/react-router/ssr.server"
import { Outlet, redirect, Scripts, ScrollRestoration } from "react-router"

import type { Route } from "./+types/auth"

import { Footer } from "~/components/component/Footer"
import { ReactHeader } from "~/components/component/Header"
import "~/styles/global.css"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
]

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  if (auth.isAuthenticated) return redirect("/")
}

export default function App() {
  return (
    <div className="h-dvh">
      <ReactHeader title="ポータル">
        <></>
      </ReactHeader>
      <main className="min-h-4/5 p-3 md:p-6 mx-auto max-w-3xl overflow-y-auto mb-auto">
        <Outlet />
      </main>
      <ScrollRestoration />
      <Scripts />
      <Footer />
    </div>
  )
}
