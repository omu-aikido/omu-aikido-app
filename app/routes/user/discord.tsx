import { useUser } from "@clerk/react-router"
import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import { useState } from "react"
import { redirect } from "react-router"

import type { Route } from "./+types/discord"

import { Icon } from "~/components/ui/Icon"

// MARK: Loader
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
  const discordAccount = user.externalAccounts?.find(acc => acc.provider === "oauth_discord")
  const username = user.username || ""
  return {
    user,
    email,
    discordAccount,
    username,
  }
}

// MARK: Component
export default function Discord({ loaderData }: Route.ComponentProps) {
  const { user } = useUser()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleConnectDiscord = async () => {
    if (!user) return

    setIsConnecting(true)
    try {
      const externalAccount = await user.createExternalAccount({
        strategy: "oauth_discord",
        redirectUrl: `${window.location.href}`,
      })

      // 外部認証プロバイダーにリダイレクト
      if (externalAccount.verification?.externalVerificationRedirectURL) {
        window.location.href =
          externalAccount.verification.externalVerificationRedirectURL.toString()
      }
    } catch (error) {
      // Discord連携エラーを処理
      if (error instanceof Error) {
        alert("Discord連携に失敗しました。もう一度お試しください。")
      }
      setIsConnecting(false)
    }
  }

  const handleDisconnectDiscord = async () => {
    if (!user) return

    setIsDisconnecting(true)
    try {
      const discordExternalAccount = user.externalAccounts.find(acc => acc.provider === "discord")

      if (discordExternalAccount) {
        await discordExternalAccount.destroy()

        window.location.reload()
      } else {
        throw new Error("Discord連携が見つかりません")
      }
    } catch (error) {
      if (error instanceof Error) {
        alert("Discord連携の解除に失敗しました。もう一度お試しください。")
      }
      setIsDisconnecting(false)
    }
  }

  return (
    <>
      <div className="max-w-lg mx-auto p-4">
        {loaderData.discordAccount ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-indigo-50 border-indigo-200">
              {loaderData.discordAccount.imageUrl ? (
                <img
                  src={loaderData.discordAccount.imageUrl}
                  alt="Discord プロフィール画像"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">D</span>
                </div>
              )}
              <div>
                <span className="font-medium text-indigo-800 flex flex-row items-center">
                  <Icon icon="discord-logo" />
                  {loaderData.discordAccount.username || "Discord ユーザー"}
                </span>
                <p className="text-sm text-indigo-600">
                  {loaderData.discordAccount.emailAddress || "連携済み"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDisconnectDiscord}
              disabled={isDisconnecting}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisconnecting ? "解除中..." : "Discord連携を解除"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleConnectDiscord}
              disabled={isConnecting}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  連携中...
                </>
              ) : (
                "Discord連携する"
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
