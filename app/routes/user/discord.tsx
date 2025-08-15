import { useUser } from "@clerk/react-router"
import { useState } from "react"
import { useOutletContext } from "react-router"

import { Icon } from "~/components/ui/Icon"
import type { UserLayoutComponentProps } from "~/layout/user"

export function meta() {
  return [
    { title: "Discord連携 | ハム大合気ポータル" },
    { name: "description", content: "Discord連携機能の設定" },
  ]
}

// MARK: Component
export default function Discord() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const context = useOutletContext<UserLayoutComponentProps>()
  const { loaderData } = context
  const { user } = useUser()

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
      const discordExternalAccount = user.externalAccounts.find(
        acc => acc.provider === "discord",
      )

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
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800">
              {loaderData.discordAccount.imageUrl ? (
                <img
                  src={loaderData.discordAccount.imageUrl}
                  alt="Discord プロフィール画像"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500 dark:bg-indigo-700 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">D</span>
                </div>
              )}
              <div>
                <span className="font-medium text-indigo-800 dark:text-indigo-200 flex flex-row items-center">
                  <Icon icon="discord-logo" />
                  {loaderData.discordAccount.username || "Discord ユーザー"}
                </span>
                <p className="text-sm text-indigo-600 dark:text-indigo-300">
                  {loaderData.discordAccount.emailAddress || "連携済み"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDisconnectDiscord}
              disabled={isDisconnecting}
              className="bg-red-500 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 dark:hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="bg-indigo-500 dark:bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-600 dark:hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
