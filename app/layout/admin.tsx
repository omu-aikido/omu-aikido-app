import { getAuth } from "@clerk/react-router/ssr.server"
import { Outlet, redirect } from "react-router"

import { getProfile } from "../lib/query/profile"

import type { Route } from "./+types/admin"

import { Role } from "~/lib/zod"
import { style } from "~/styles/component"

// MARK: Loader - 共通の認証処理
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args)
  const { env } = args.context.cloudflare
  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }
  const profile = await getProfile({ userId, env })
  if (!profile) return redirect("/")
  const role = Role.fromString(profile.role)
  if (!role || !role.isManagement()) return redirect("/")
}

// MARK: Component - 共通のレイアウトとナビゲーション
export default function AccountLayout() {
  return (
    <div data-testid="admin-layout-container">
      <h1 className={style.text.sectionTitle()} data-testid="admin-layout-title">
        管理ページ
      </h1>
      <div className="mt-6" data-testid="admin-layout-content">
        <Outlet />
      </div>
    </div>
  )
}
