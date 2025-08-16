import type { SignUpResource } from "@clerk/types"
import React from "react"

import { Icon } from "~/components/ui/Icon"
import { style } from "~/styles/component"

export default function SignUpWithDiscord({
  signUp,
  loading,
  setLoading,
  isLoaded,
}: {
  signUp: SignUpResource | undefined
  loading: boolean
  setLoading: (loading: boolean) => void
  isLoaded: boolean
}) {
  const [errors, setFormErrors] = React.useState<Record<string, string>>({})
  const [legalAccepted, setLegalAccepted] = React.useState(false)

  return (
    <>
      <div className="mb-4">
        <div className="flex items-start gap-3">
          <input
            id="discordLegalAccepted"
            type="checkbox"
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            checked={legalAccepted}
            onChange={e => {
              setLegalAccepted(e.target.checked)
            }}
          />
          <label
            htmlFor="discordLegalAccepted"
            className="text-sm text-gray-900 dark:text-gray-300"
          >
            <a
              href="https://omu-aikido.com/terms-of-service/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              利用規約
            </a>
            および
            <a
              href="https://omu-aikido.com/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              プライバシーポリシー
            </a>
            に同意します
          </label>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-2 px-4 bg-[#5865F2] dark:bg-[#4752C4] text-white font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#4752C4] dark:hover:bg-[#36418C] transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={async () => {
          if (!isLoaded || !signUp) return
          const discordLegalCheckbox = document.getElementById(
            "discordLegalAccepted",
          ) as HTMLInputElement
          if (!discordLegalCheckbox?.checked) {
            setFormErrors(prev => ({
              ...(prev ?? {}),
              discordLegalAccepted:
                "利用規約とプライバシーポリシーに同意する必要があります",
            }))
            return
          }

          // エラーをクリア
          setFormErrors(prev => {
            const newErrors = { ...(prev ?? {}) }
            delete newErrors.discordLegalAccepted
            return Object.keys(newErrors).length === 0 ? {} : newErrors
          })

          setLoading(true)
          try {
            await signUp.authenticateWithRedirect({
              strategy: "oauth_discord",
              redirectUrl: "/sign-up/sso-callback",
              redirectUrlComplete: "/onboarding",
              legalAccepted,
            })
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading || !legalAccepted}
      >
        <Icon icon={"discord-logo"} size="24" />
        Discordで認証
      </button>
      {errors.discordLegalAccepted && (
        <div className={style.text.error({ className: "'mt-2'" })}>
          {errors.discordLegalAccepted}
        </div>
      )}
    </>
  )
}
