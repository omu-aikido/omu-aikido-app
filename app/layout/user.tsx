import { getAuth } from "@clerk/react-router/server"
import { Outlet, redirect } from "react-router"

import type { Route } from "./+types/user"
export type UserLayoutComponentProps = Route.ComponentProps

import { NavigationTab } from "~/components/ui/NavigationTab"
import { uc } from "~/lib/api-client"

// MARK: Loader - 共通の認証処理
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }
  const client = uc({ request: args.request })
  const response = await client.account.$get()
  if (response.status === 401) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }
  if (!response.ok) {
    throw new Error("アカウント情報の取得に失敗しました。")
  }
  const { user } = await response.json()
  const email = user.emailAddresses?.[0]?.emailAddress || ""
  const discordAccount = Array.isArray(user.externalAccounts)
    ? user.externalAccounts.find(
        acc =>
          typeof acc === "object" &&
          acc !== null &&
          Object.prototype.hasOwnProperty.call(acc, "provider") &&
          acc.provider === "oauth_discord",
      )
    : undefined
  const username = user.username || ""

  return { userId, user, email, discordAccount, username }
}

// MARK: Component - 共通のレイアウトとナビゲーション
export default function AccountLayout(args: Route.ComponentProps) {
  const navigationTabs = [
    { to: "/account", label: "プロフィール" },
    { to: "/account/status", label: "ステータス" },
  ]

  return (
    <div data-testid="user-layout-container">
      <h1
        className="text-xl font-bold mb-4"
        data-testid="user-layout-title"
      >{`アカウント: ${args.loaderData.user.lastName} ${args.loaderData.user.firstName}`}</h1>
      <NavigationTab tabs={navigationTabs} />
      <div className="mt-6" data-testid="user-layout-content">
        <Outlet context={args} />
      </div>
    </div>
  )
}
