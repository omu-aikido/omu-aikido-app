import { useSignUp } from "@clerk/react-router"
import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import * as React from "react"
import { useEffect, useState } from "react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { Form, redirect, useFetcher, useNavigate } from "react-router"

import { style } from "~/styles/component"

export async function loader(args: LoaderFunctionArgs) {
  const auth = await getAuth(args)

  // 認証済みの場合はホームページにリダイレクト
  if (auth.isAuthenticated) {
    return redirect("/")
  }

  return null
}

// MARK: Meta
export function meta() {
  return [
    { title: "メール認証 | ハム大合気ポータル" },
    { name: "description", content: "メール認証ページ" },
  ]
}

// MARK: Server Action for metadata migration
export async function action(args: ActionFunctionArgs) {
  if (args.request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    // Cloudflare環境から秘密キーを取得
    const secretKey = args.context.cloudflare.env.CLERK_SECRET_KEY
    if (!secretKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const clerkClient = createClerkClient({ secretKey })

    const formData = await args.request.formData()
    const email = formData.get("email")
    const userId = formData.get("userId")
    if (typeof email !== "string" || typeof userId !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "入力内容に誤りがあります" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // リクエストから認証状態を取得
    const auth = await getAuth(args)

    if (!auth || !auth.userId || userId !== auth.userId) {
      return new Response(
        JSON.stringify({ success: false, error: "認証に失敗しました" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    // ユーザー情報を取得
    const user = await clerkClient.users.getUser(auth.userId)

    // unsafeMetadataからプロファイル情報を取得
    const unsafeMetadata = user.unsafeMetadata as {
      year?: string
      grade?: number
      joinedAt?: number
      getGradeAt?: string | null
    }

    if (!unsafeMetadata || typeof unsafeMetadata !== "object") {
      return new Response(
        JSON.stringify({ success: false, error: "入力内容に誤りがあります" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // 値の型・範囲チェック
    const year = typeof unsafeMetadata.year === "string" ? unsafeMetadata.year : undefined
    const grade =
      typeof unsafeMetadata.grade === "number" ? unsafeMetadata.grade : undefined
    const joinedAt =
      typeof unsafeMetadata.joinedAt === "number" &&
      unsafeMetadata.joinedAt >= 2000 &&
      unsafeMetadata.joinedAt <= 2100
        ? unsafeMetadata.joinedAt
        : undefined

    let getGradeAt: string = ""
    if (unsafeMetadata.getGradeAt !== null && typeof unsafeMetadata.getGradeAt === "string" && unsafeMetadata.getGradeAt.trim() !== "") {
      const dateStr = unsafeMetadata.getGradeAt.trim()
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        getGradeAt = date.toISOString()
      }
    }

    if (!year || grade === undefined || joinedAt === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: "入力内容に誤りがあります" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // プロファイルデータをpublicMetadataに移動
    const profileData = { year, grade, joinedAt, getGradeAt, role: "member" as const }

    // publicMetadataを更新し、unsafeMetadataをクリア（1回のAPIコールで両方設定）
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: profileData,
      unsafeMetadata: {},
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

// MARK: Component
export default function VerifyEmailPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const navigate = useNavigate()
  const fetcher = useFetcher()

  const [otpCode, setOtpCode] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const [migrationTriggered, setMigrationTriggered] = useState(false)

  // サインアップセッションが存在しない場合はサインアップページにリダイレクト
  useEffect(() => {
    if (isLoaded && (!signUp || signUp.status !== "missing_requirements")) {
      navigate("/sign-up")
    }
  }, [isLoaded, signUp, navigate])

  // 再送信用のカウントダウン
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setIsLoading(true)
    setErrors({})

    try {
      // メール認証を試行
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      })

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId })

        const userId = completeSignUp.createdUserId
        if (userId && signUp.emailAddress) {
          setMigrationTriggered(true)
          fetcher.submit({ email: signUp.emailAddress, userId }, { method: "POST" })
        } else {
          navigate("/")
        }
      } else {
        setErrors({ general: "認証に失敗しました。もう一度お試しください。" })
      }
    } catch {
      setErrors({ general: "認証に失敗しました。もう一度お試しください。" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded || !signUp || !canResend) return

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setCanResend(false)
      setCountdown(60) // 60秒のクールダウン
      setErrors({})
    } catch {
      setErrors({ general: "認証コードの再送信に失敗しました" })
    }
  }

  // migrationの結果を監視
  useEffect(() => {
    if (migrationTriggered && fetcher.state === "idle") {
      if (fetcher.data?.success) {
        navigate("/")
      } else if (fetcher.data?.error) {
        setErrors({ general: "処理中にエラーが発生しました。もう一度お試しください。" })
        setIsLoading(false)
        setMigrationTriggered(false)
      }
    }
  }, [fetcher.state, fetcher.data, migrationTriggered, navigate])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          <p className="mt-2 text-sm text-slate-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!signUp || signUp.status !== "missing_requirements") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-600">
            サインアップページにリダイレクトしています...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 px-4 py-8 sm:px-6 sm:py-10 rounded-lg shadow-md bg-white dark:bg-slate-800 transition-colors duration-300 mx-2 sm:mx-0">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            メール認証
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            ご登録いただいたメールアドレスに送信された認証コードを入力してください
          </p>
          {signUp.emailAddress && (
            <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400 break-all">
              {signUp.emailAddress}
            </p>
          )}
        </div>

        <Form onSubmit={handleVerifyEmail} className="space-y-6">
          {errors.general && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <div className="h-5 w-5 text-red-400" aria-hidden="true">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>警告</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="sr-only" aria-label="警告">警告</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    エラー
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-100">
                    <p>{errors.general}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="otpCode"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              認証コード
            </label>
            <div className="mt-1">
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className={`${style.form.input()} ${
                  errors.otpCode
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-400"
                    : "dark:bg-slate-700 dark:text-white"
                }`}
                placeholder="123456"
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {errors.otpCode && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                  {errors.otpCode}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className={`${style.button({ type: "primary" })} w-full ${
                isLoading || otpCode.length !== 6 ? "cursor-not-allowed opacity-50" : ""
              } dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white dark:border-slate-600 dark:border-t-blue-400" />
                  認証中...
                </div>
              ) : (
                "メール認証を完了"
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend}
              className={`text-sm ${
                canResend
                  ? "text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  : "text-slate-400 dark:text-slate-500 cursor-not-allowed"
              }`}
            >
              {canResend ? "認証コードを再送信" : `再送信まで ${countdown}秒`}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/sign-up")}
              className="text-sm text-slate-600 hover:text-slate-500 dark:text-slate-300 dark:hover:text-slate-100"
            >
              ← サインアップに戻る
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
