import { useUser } from "@clerk/react-router"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Icon } from "~/components/ui/Icon"

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
  const { user } = useUser()
  const discordAccount = user?.externalAccounts.find(acc => acc.provider === "discord")

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
        {discordAccount ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800">
              {discordAccount.imageUrl ? (
                <img
                  src={discordAccount.imageUrl}
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
                  {discordAccount.username || "Discord ユーザー"}
                </span>
                <p className="text-sm text-indigo-600 dark:text-indigo-300">
                  {discordAccount.emailAddress || "連携済み"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDisconnectDiscord}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? "解除中..." : "Discord連携を解除"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleConnectDiscord}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  連携中...
                </>
              ) : (
                "Discord連携する"
              )}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
