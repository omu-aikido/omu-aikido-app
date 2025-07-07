import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server"
import * as profile from "@/src/lib/query/profile"
import { Role } from "@/src/zod"
import type { PagePath } from "./type"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/apps(.*)", "/account(.*)"])
const isAccountRecoverlyRoute = createRouteMatcher(["/account/setup", "/account/recovery"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isApiRequest = createRouteMatcher(["/api(.*)"])

export const onRequest = clerkMiddleware(async (auth, context, next) => {
  const { redirectToSignIn, userId, isAuthenticated } = auth()

  context.locals.paths = [
    {
      name: "ホーム",
      href: "/dashboard",
      desc: "ダッシュボードへ",
    },
    {
      name: "アプリ",
      href: "/apps",
      desc: "アプリの一覧",
    },
    {
      name: "アカウント",
      href: "/account",
      desc: "アカウント設定を行う",
    },
  ]

  if ((isProtectedRoute(context.request) && !isAuthenticated) || !userId) return redirectToSignIn()

  if (isApiRequest(context.request) || isAccountRecoverlyRoute(context.request)) return next()

  const userProfile = await profile.getProfile({ userId: userId })

  if (userProfile instanceof Response) {
    switch (userProfile.status) {
      case 404:
        return context.redirect("/account/setup")
      case 422:
        return context.redirect("/account/recovery")
      default:
        return next()
    }
  }

  context.locals.profile = userProfile
  const role = Role.fromString(userProfile.role)
  context.locals.paths = appendPaths(context.locals.paths, role)

  if (isAdminRoute(context.request)) {
    if (role && !role.isManagement()) return context.redirect("/dashboard")
  }

  return next()
})

function appendPaths(paths: PagePath[], role: Role | null): PagePath[] {
  if (role && role.isManagement())
    paths.push({ name: "管理", href: "/admin", desc: "管理者ページ" })

  return paths
}
