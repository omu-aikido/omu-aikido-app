import { useSignUp } from "@clerk/react-router"
import { isClerkAPIResponseError } from "@clerk/react-router/errors"
import { getAuth } from "@clerk/react-router/ssr.server"
import type { ClerkAPIError } from "@clerk/types"
import * as React from "react"
import { useState } from "react"
import type { LoaderFunctionArgs } from "react-router"
import { redirect, useNavigate } from "react-router"

import { style } from "~/styles/component"

// MARK: Loader
export async function loader(args: LoaderFunctionArgs) {
  const auth = await getAuth(args)
  if (auth.isAuthenticated) return redirect("/")
}

// MARK: Meta
export function meta() {
  return [
    { title: "メール認証 | ハム大合気ポータル" },
    { name: "description", content: "メール認証ページ" },
  ]
}

// MARK: Component
export default function VerifyPage() {
  const { signUp, isLoaded, setActive } = useSignUp()
  const navigate = useNavigate()

  const [code, setCode] = useState("")
  const [clerkErrors, setClerkErrors] = React.useState<ClerkAPIError[]>([])
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Clerkの準備状態確認
  const canSubmit = isLoaded && signUp && !loading

  // メール認証コード検証の処理
  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setClerkErrors([])
    setFormErrors({})

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code })
      if (signUpAttempt.status === "complete") {
        setIsVerificationSuccess(true)
        await setActive({ session: signUpAttempt.createdSessionId })
        navigate("/onboarding")
      } else {
        // eslint-disable-next-line no-console
        console.error("認証が完了しませんでした。", signUpAttempt.missingFields)
        setFormErrors({ general: "認証が完了しませんでした。再度お試しください。" })
        setLoading(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("認証コードの検証に失敗しました。", err)
      if (isClerkAPIResponseError(err)) setClerkErrors(err.errors)
      const errorMessage = "認証に失敗しました。再度お試しください。"
      setFormErrors({ general: errorMessage })
      setLoading(false)
    }
  }

  // 認証コード再送機能
  const handleResendCode = async () => {
    if (!isLoaded || !signUp || resendCooldown > 0) return

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setResendCooldown(60) // 60秒のクールダウン

      // クールダウンタイマー
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setFormErrors({})
    } catch {
      setFormErrors({
        general: "認証コードの再送に失敗しました。しばらく待ってから再度お試しください。",
      })
    }
  }

  // SignUpが存在しない場合はサインアップページへリダイレクト
  React.useEffect(() => {
    if (isLoaded && !signUp) {
      navigate("/sign-up")
    }
  }, [isLoaded, signUp, navigate])

  if (!isLoaded) {
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <div className="text-center py-8">
          <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-t-transparent rounded-full border-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!signUp) {
    return null // useEffectでリダイレクトするので表示しない
  }

  return (
    <div className={style.card.container({ class: "max-w-md mx-auto" })}>
      <h1 className={style.text.sectionTitle()}>メール認証</h1>

      {(() => {
        if (loading) {
          return (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-t-transparent rounded-full border-blue-600" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">処理中...</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                しばらくお待ちください
              </p>
            </div>
          )
        }

        if (isVerificationSuccess) {
          return (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-t-transparent rounded-full border-green-600" />
              <p className="text-sm text-slate-500 dark:text-slate-500">
                ローディング中...
              </p>
            </div>
          )
        }

        // 入力フォーム
        return (
          <>
            <p className="mb-4 text-slate-600 dark:text-slate-400">
              メールに届いた認証コードを入力してください
            </p>
            <form
              onSubmit={handleVerifySubmit}
              className={style.form.container({ vertical: true })}
            >
              <label htmlFor="code" className={style.form.label({ necessary: true })}>
                認証コード
              </label>
              <input
                id="code"
                name="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                className={style.form.input({ class: "col-span-2" })}
                required
                disabled={loading}
                placeholder="認証コードを入力"
              />
              <button
                type="submit"
                className={style.button({ type: "primary", class: "col-span-3" })}
                disabled={!canSubmit || !code.trim()}
              >
                <div className="flex items-center justify-center gap-2">
                  {!canSubmit && (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  )}
                  <span>
                    {!canSubmit
                      ? isVerificationSuccess
                        ? "認証完了！"
                        : "認証処理中..."
                      : "認証する"}
                  </span>
                </div>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                認証コードが届かない場合
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className={style.button({ type: "secondary", class: "text-sm" })}
              >
                {resendCooldown > 0 ? `再送まで ${resendCooldown}秒` : "認証コードを再送"}
              </button>
            </div>
            <hr />
            <div className="text-center">
              <button
                type="button"
                className={style.button({ type: "danger", class: "text-sm" })}
                onClick={() => {
                  if (
                    window.confirm("入力はリセットされます。よろしいですか？")
                  ) {
                    navigate("/sign-up")
                  }
                }}
              >
                最初からやり直す
              </button>
            </div>
          </>
        )
      })()}

      {formErrors && formErrors.general && (
        <div className={style.text.error({ className: "mt-4" })}>
          {formErrors.general}
        </div>
      )}
      {clerkErrors && (
        <ul>
          {clerkErrors.map((el, index) => (
            <li key={index}>{el.longMessage ?? el.message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
