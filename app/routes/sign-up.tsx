import { useSignUp } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import * as React from "react"
import { useState } from "react"
import { Link, redirect, useFetcher, useNavigate } from "react-router"
import { tv } from "tailwind-variants"

import type { Route } from "./+types/sign-up"

import { Icon } from "~/components/ui/Icon"
import { grade, JoinedAtYearRange, year } from "~/lib/utils"
import { style } from "~/styles/component"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  if (auth.isAuthenticated) return redirect("/")
}

// MARK: Meta
export function meta() {
  return [
    { title: "サインアップ | ハム大合気ポータル" },
    { name: "description", content: "サインアップページ" },
  ]
}

// MARK: Client Action
// eslint-disable-next-line react-refresh/only-export-components
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData()

  // 全フィールドを取得
  const email = formData.get("email") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const username = formData.get("username") as string
  const year = formData.get("year") as string
  const grade = formData.get("grade") as string
  const joinedAt = formData.get("joinedAt") as string
  const getGradeAt = formData.get("getGradeAt") as string

  const errors: Record<string, string> = {}

  // クライアントサイドバリデーション
  if (!email) {
    errors.email = "メールアドレスは必須です"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "有効なメールアドレスを入力してください"
  }

  if (!newPassword) {
    errors.newPassword = "パスワードは必須です"
  } else if (newPassword.length < 8) {
    errors.newPassword = "パスワードは8文字以上である必要があります"
  }

  if (!confirmPassword) {
    errors.confirmPassword = "パスワード確認は必須です"
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "パスワードが一致しません"
  }

  if (!firstName || firstName.trim() === "") {
    errors.firstName = "名は必須です"
  }

  if (!lastName || lastName.trim() === "") {
    errors.lastName = "姓は必須です"
  }

  // プロファイル情報のバリデーション
  if (!year) {
    errors.year = "学年は必須です"
  }

  if (!grade) {
    errors.grade = "級段位は必須です"
  }

  if (!joinedAt) {
    errors.joinedAt = "入部年度は必須です"
  } else {
    const joinedAtNum = parseInt(joinedAt)
    if (isNaN(joinedAtNum) || joinedAtNum < 2000 || joinedAtNum > 2030) {
      errors.joinedAt = "入部年度は2000年から2030年の間で入力してください"
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    formData: {
      email,
      newPassword,
      firstName,
      lastName,
      username: username || undefined,
      year,
      grade: parseInt(grade),
      joinedAt: parseInt(joinedAt),
      getGradeAt: getGradeAt.trim() === "" ? null : getGradeAt,
    },
  }
}

// MARK: Component
export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp()
  const fetcher = useFetcher()
  const navigate = useNavigate()

  const [step, setStep] = useState<"basic" | "personal" | "profile">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [isSignUpCreated, setIsSignUpCreated] = useState(false)

  // fetcher.Form用のref
  const formRef = React.useRef<HTMLFormElement>(null)

  // Clerkの準備状態確認（最終ステップのみ送信可能）
  const canSubmit = step === "profile" && isLoaded && signUp

  // クライアントサイドでのClerk登録処理
  const handleClerkSignUp = React.useCallback(
    async (validatedData: {
      email: string
      newPassword: string
      firstName: string
      lastName: string
      username?: string
      year: string
      grade: number
      joinedAt: number
      getGradeAt: string | null
    }) => {
      if (!isLoaded || !signUp || !validatedData || isSignUpCreated) {
        // CAPTCHAが関与する可能性がある場合はエラーを表示しない
        if (!isSignUpCreated) {
          setErrors({ general: "認証サービスが利用できません" })
        }
        setLoading(false)
        return
      }

      try {
        setIsSignUpCreated(true) // 重複防止フラグを設定

        const signUpParams = {
          emailAddress: validatedData.email,
          password: validatedData.newPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          username: validatedData.username,
          unsafeMetadata: {
            year: validatedData.year,
            grade: validatedData.grade,
            joinedAt: validatedData.joinedAt,
            getGradeAt: validatedData.getGradeAt,
          },
        }

        await signUp.create(signUpParams)
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        navigate("/sign-up/verify")
      } catch (err) {
        setIsSignUpCreated(false) // エラー時にフラグをリセット
        let errorMsg = "ユーザー登録に失敗しました"

        // Clerkのエラーメッセージを安全に取得
        if (typeof err === "object" && err && "errors" in err) {
          const clerkErrors = (err as { errors?: { message?: string; code?: string }[] })
            .errors
          if (clerkErrors && clerkErrors.length > 0) {
            const firstError = clerkErrors[0]

            // 特定のエラーコードに基づいてユーザーフレンドリーなメッセージを提供
            if (firstError.code === "form_identifier_exists") {
              errorMsg = "このメールアドレスは既に使用されています"
            } else if (firstError.code === "form_password_pwned") {
              errorMsg =
                "このパスワードは安全ではありません。別のパスワードを使用してください"
            } else if (firstError.code === "form_username_exists") {
              errorMsg = "このユーザー名は既に使用されています"
            } else if (firstError.code === "captcha_invalid") {
              errorMsg = "セキュリティ認証に失敗しました。再度お試しください"
            } else if (firstError.message && firstError.message.length < 100) {
              errorMsg = firstError.message
            }
          }
        }

        setErrors({ general: errorMsg })
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, signUp, isSignUpCreated, navigate],
  )
  const nextStep = () => {
    if (step === "basic") setStep("personal")
    else if (step === "personal") setStep("profile")
  }

  const prevStep = () => {
    if (step === "personal") {
      setStep("basic")
    } else if (step === "profile") {
      setStep("personal")
      setIsSignUpCreated(false)
    }
  }

  // 各ステップのバリデーション
  const validateStep = (currentStep: string): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formRef.current) return false
    const formData = new FormData(formRef.current)

    if (currentStep === "basic") {
      const email = formData.get("email") as string
      const newPassword = formData.get("newPassword") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (!email) {
        newErrors.email = "メールアドレスは必須です"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "有効なメールアドレスを入力してください"
      }

      if (!newPassword) {
        newErrors.newPassword = "パスワードは必須です"
      } else if (newPassword.length < 8) {
        newErrors.newPassword = "パスワードは8文字以上である必要があります"
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "パスワード確認は必須です"
      } else if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "パスワードが一致しません"
      }
    } else if (currentStep === "personal") {
      const firstName = formData.get("firstName") as string
      const lastName = formData.get("lastName") as string

      if (!firstName) {
        newErrors.firstName = "名は必須です"
      }
      if (!lastName) {
        newErrors.lastName = "姓は必須です"
      }
    } else if (currentStep === "profile") {
      const year = formData.get("year") as string
      const grade = formData.get("grade") as string
      const joinedAt = formData.get("joinedAt") as string

      if (!year) {
        newErrors.year = "学年は必須です"
      }
      if (!grade) {
        newErrors.grade = "級段位は必須です"
      }
      if (!joinedAt) {
        newErrors.joinedAt = "入部年度は必須です"
      } else {
        const joinedAtNum = parseInt(joinedAt)
        if (isNaN(joinedAtNum) || joinedAtNum < 2000 || joinedAtNum > 2030) {
          newErrors.joinedAt = "入部年度は2000年から2030年の間で入力してください"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ステップ進行処理（fetcher.Form用）
  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (validateStep(step)) {
      if (step === "profile") {
        // submitはfetcher.FormのonSubmitで
        setLoading(true)
      } else {
        nextStep()
      }
    }
  }

  // clientActionの結果を処理
  React.useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      setLoading(false)
      const result = fetcher.data as {
        success: boolean
        errors?: Record<string, string>
        formData?: {
          email: string
          newPassword: string
          firstName: string
          lastName: string
          username?: string
          year: string
          grade: number
          joinedAt: number
          getGradeAt: string | null
        }
      }
      if (result.errors) {
        const serverErrors = result.errors
        setErrors(serverErrors)
        // エラーがあるステップに戻る
        if (
          serverErrors.email ||
          serverErrors.newPassword ||
          serverErrors.confirmPassword
        ) {
          setStep("basic")
          setIsSignUpCreated(false)
        } else if (
          serverErrors.firstName ||
          serverErrors.lastName ||
          serverErrors.username
        ) {
          setStep("personal")
          setIsSignUpCreated(false)
        } else if (
          serverErrors.year ||
          serverErrors.grade ||
          serverErrors.joinedAt ||
          serverErrors.getGradeAt
        ) {
          setStep("profile")
          setIsSignUpCreated(false)
        }
      } else if (result.success && result.formData) {
        setLoading(true)
        handleClerkSignUp(result.formData)
      }
    }
  }, [fetcher.data, fetcher.state, handleClerkSignUp])

  return (
    <div className={style.card.container({ class: "max-w-md mx-auto" })}>
      <h1 className={style.text.sectionTitle()}>サインアップ</h1>
      <ProgressIndicator step={step} />
      <fetcher.Form
        ref={formRef}
        method="post"
        onSubmit={e => {
          // 最終ステップ以外はsubmitせず、step進行のみ
          if (step !== "profile") {
            e.preventDefault()
            handleNext(e)
          } else {
            // profileステップのみsubmit許可
            if (!canSubmit) {
              e.preventDefault()
            }
          }
        }}
      >
        <div
          className={`${style.form.container({ vertical: true })} ${step === "basic" ? "" : "hidden"}`}
        >
          <h2 className="col-span-3 text-lg font-semibold mb-2">基本情報</h2>
          <label htmlFor="email" className={style.form.label({ necessary: true })}>
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          {errors.email && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.email}
            </div>
          )}
          <label htmlFor="password" className={style.form.label({ necessary: true })}>
            パスワード
          </label>
          <input
            id="password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          {errors.newPassword && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.newPassword}
            </div>
          )}
          <label
            htmlFor="password-confirm"
            className={style.form.label({ necessary: true })}
          >
            パスワード確認
          </label>
          <input
            id="password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          {errors.confirmPassword && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.confirmPassword}
            </div>
          )}
          <button
            type="button"
            onClick={handleNext}
            className={style.button({ type: "primary", class: "col-span-3" })}
            disabled={loading}
          >
            <div className="flex items-center justify-center gap-2">
              {loading && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              <span>次へ</span>
            </div>
          </button>
        </div>

        <div
          className={`${style.form.container({ vertical: true })} ${step === "personal" ? "" : "hidden"}`}
        >
          <h2 className="col-span-3 text-lg font-semibold mb-2">個人情報</h2>
          <label htmlFor="lastName" className={style.form.label({ necessary: true })}>
            姓
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          {errors.lastName && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.lastName}
            </div>
          )}
          <label htmlFor="firstName" className={style.form.label({ necessary: true })}>
            名
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          {errors.firstName && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.firstName}
            </div>
          )}
          <label htmlFor="username" className={style.form.label({ necessary: false })}>
            ユーザー名
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            className={style.form.input({ class: "col-span-2" })}
          />
          {errors.username && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.username}
            </div>
          )}
          <div className="col-span-3 flex gap-2">
            <button
              type="button"
              onClick={prevStep}
              className={style.button({ type: "secondary", class: "flex-1" })}
            >
              戻る
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={style.button({ type: "primary", class: "flex-1" })}
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2">
                {loading && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                <span>次へ</span>
              </div>
            </button>
          </div>
        </div>

        <div
          className={`${style.form.container({ vertical: true })} ${step === "profile" ? "" : "hidden"}`}
        >
          <h2 className="col-span-3 text-lg font-semibold mb-2">プロファイル情報</h2>
          <label htmlFor="year" className={style.form.label({ necessary: true })}>
            学年
          </label>
          <select
            id="year"
            name="year"
            defaultValue="b1"
            required
            className={style.form.input({ class: "col-span-2" })}
          >
            {yearOptions()}
          </select>
          {errors.year && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.year}
            </div>
          )}
          <label htmlFor="grade" className={style.form.label({ necessary: true })}>
            現在の級段位
          </label>
          <select
            id="grade"
            name="grade"
            defaultValue="0"
            required
            className={style.form.input({ class: "col-span-2" })}
          >
            {gradeOptions()}
          </select>
          {errors.grade && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.grade}
            </div>
          )}
          <label htmlFor="joinedAt" className={style.form.label({ necessary: true })}>
            入部年度
          </label>
          <input
            id="joinedAt"
            name="joinedAt"
            type="number"
            defaultValue={new Date().getFullYear().toString()}
            required
            className={style.form.input({ class: "col-span-2" })}
            min={JoinedAtYearRange.min}
            max={JoinedAtYearRange.max}
          />
          {errors.joinedAt && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.joinedAt}
            </div>
          )}
          <label htmlFor="getGradeAt" className={style.form.label({ necessary: false })}>
            級段位取得日
          </label>
          <input
            id="getGradeAt"
            name="getGradeAt"
            type="date"
            className={style.form.input({ class: "col-span-2" })}
          />
          {errors.getGradeAt && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {errors.getGradeAt}
            </div>
          )}
          <div className="col-span-3 flex gap-2">
            <button
              type="button"
              onClick={prevStep}
              className={style.button({ type: "secondary", class: "flex-1" })}
            >
              戻る
            </button>
            <button
              type="submit"
              className={style.button({ type: "primary", class: "flex-1" })}
              disabled={!canSubmit}
            >
              <div className="flex items-center justify-center gap-2">
                {!canSubmit && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                <span>{canSubmit ? "アカウントを作成" : "処理中..."}</span>
              </div>
            </button>
          </div>
        </div>
        <div className="col-span-3 my-2">
          <div
            id="clerk-captcha"
            data-cl-size="flexible"
            data-cl-theme={
              window.matchMedia &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
            }
            data-cl-language="ja-jp"
          />
        </div>
      </fetcher.Form>
      <hr className="my-6" />
      <button
        type="button"
        className="w-full py-2 px-4 bg-[#5865F2] dark:bg-[#4752C4] text-white font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#4752C4] dark:hover:bg-[#36418C] transition disabled:opacity-50"
        onClick={async () => {
          if (!isLoaded || !signUp) return
          setLoading(true)
          try {
            await signUp.authenticateWithRedirect({
              strategy: "oauth_discord",
              redirectUrl: "/sign-up/sso-callback",
              redirectUrlComplete: "/onboarding",
            })
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
      >
        <Icon icon={"discord-logo"} size="24" />
        Discordで認証
      </button>
      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        既にアカウントをお持ちですか？
        <br />
        <span className={style.text.link()}>
          <Link to="/sign-in">こちら</Link>
        </span>
        からサインインしてください。
      </div>
      {errors.general && (
        <div className={style.text.error({ className: "mt-4" })}>{errors.general}</div>
      )}
    </div>
  )
}

// 学年・級の選択肢生成
function yearOptions() {
  return year.map(y => (
    <option key={y.year} value={y.year}>
      {y.name}
    </option>
  ))
}

function gradeOptions() {
  return grade.map(g => (
    <option key={g.grade} value={g.grade}>
      {g.name}
    </option>
  ))
}

const ProgressIndicator = ({ step }: { step: "basic" | "personal" | "profile" }) => {
  const steps = ["基本情報", "個人情報", "プロファイル"]
  const currentIndex =
    step === "basic" ? 0 : step === "personal" ? 1 : step === "profile" ? 2 : 2

  const indicator = tv({
    base: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
    variants: {
      step: {
        current: "bg-blue-600 text-white",
        completed: "border-2 border-green-600 text-green-600",
        upcoming: "bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-200",
      },
    },
  })

  return (
    <div className="mb-6 flex justify-center">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div
            className={indicator({
              step:
                idx < currentIndex
                  ? "completed"
                  : idx === currentIndex
                    ? "current"
                    : "upcoming",
            })}
          >
            {idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 mx-2" />
          )}
        </div>
      ))}
    </div>
  )
}
