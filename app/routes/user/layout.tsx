import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import { Outlet, redirect } from "react-router"

import type { Route } from "./+types/layout"

import { NavigationTab } from "~/components/ui/NavigationTab"

// MARK: Types
export interface AccountLayoutContext {
  userId: string
  user: {
    id: string
    emailAddresses: Array<{ emailAddress: string }>
    username: string | null
    firstName: string | null
    lastName: string | null
    imageUrl: string
    externalAccounts: Array<{ provider: string }> | null
  }
  email: string
  discordAccount?: { provider: string }
  username: string
  env: unknown
}

// MARK: Loader - 共通の認証処理
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }

  const clerkClient = createClerkClient({
    secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
  })

  const user = await clerkClient.users.getUser(userId)
  const email = user.emailAddresses?.[0]?.emailAddress || ""
  const discordAccount = user.externalAccounts?.find(acc => acc.provider === "discord")
  const username = user.username || ""

  return {
    userId,
    user,
    email,
    discordAccount,
    username,
    env: args.context.cloudflare.env,
  }
}

// MARK: Component - 共通のレイアウトとナビゲーション
export default function AccountLayout({ loaderData }: Route.ComponentProps) {
  const navigationTabs = [
    { to: "/account", label: "プロフィール" },
    { to: "/account/status", label: "ステータス" },
    { to: "/account/security", label: "セキュリティ" },
  ]

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">{`アカウント: ${loaderData.user.lastName} ${loaderData.user.firstName}`}</h1>
      <NavigationTab tabs={navigationTabs} />
      <div className="mt-6">
        <Outlet context={loaderData} />
      </div>
    </div>
  )
}
