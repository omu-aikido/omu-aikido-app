import { useSignUp } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import * as React from "react"
import { useState } from "react"
import { Form, Link, redirect, useActionData, useNavigate } from "react-router"
import { tv } from "tailwind-variants"

import type { Route } from "./+types/sign-up"

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

// MARK: Action
export async function action(args: Route.ActionArgs) {
  const formData = await args.request.formData()

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

  // サーバーサイドバリデーション（セキュリティのため必須）
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
    return Response.json({ success: false, errors })
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

// MARK: Types
type ActionData = {
  success: boolean
  errors?: Record<string, string>
  formData?: {
    email: string
    newPassword: string
    firstName: string
    lastName: string
    username: string | undefined
    year: string
    grade: number
    joinedAt: number
    getGradeAt: string | null
  }
}

// MARK: Component
export default function SignUpPage() {
  const { signUp, isLoaded, setActive } = useSignUp()
  const actionData = useActionData() as ActionData | undefined
  const navigate = useNavigate()

  const [step, setStep] = useState<"basic" | "personal" | "profile" | "verify">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    year: "b1",
    grade: "0",
    joinedAt: new Date().getFullYear().toString(),
    getGradeAt: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // サーバーサイドバリデーション成功時のClerk登録処理
  const handleClerkSignUp = React.useCallback(
    async (validatedData: ActionData["formData"]) => {
      if (!isLoaded || !signUp || !validatedData) {
        setErrors({ general: "認証サービスが利用できません" })
        setLoading(false)
        return
      }

      try {
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
        setStep("verify")
      } catch (err) {
        let errorMsg = "ユーザー登録に失敗しました"
        if (typeof err === "object" && err && "errors" in err) {
          errorMsg =
            (err as { errors?: { message?: string }[] }).errors?.[0]?.message || errorMsg
        }
        setErrors({ general: errorMsg })
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, signUp],
  )

  // ステップナビゲーション
  const nextStep = () => {
    if (step === "basic") setStep("personal")
    else if (step === "personal") setStep("profile")
  }

  const prevStep = () => {
    if (step === "personal") setStep("basic")
    else if (step === "profile") setStep("personal")
  }

  // 各ステップのバリデーション
  const validateStep = (currentStep: string): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === "basic") {
      if (!formData.email) {
        newErrors.email = "メールアドレスは必須です"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "有効なメールアドレスを入力してください"
      }

      if (!formData.newPassword) {
        newErrors.newPassword = "パスワードは必須です"
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = "パスワードは8文字以上である必要があります"
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "パスワード確認は必須です"
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "パスワードが一致しません"
      }
    } else if (currentStep === "personal") {
      if (!formData.firstName) {
        newErrors.firstName = "名は必須です"
      }
      if (!formData.lastName) {
        newErrors.lastName = "姓は必須です"
      }
    } else if (currentStep === "profile") {
      if (!formData.year) {
        newErrors.year = "学年は必須です"
      }
      if (!formData.grade) {
        newErrors.grade = "級段位は必須です"
      }
      if (!formData.joinedAt) {
        newErrors.joinedAt = "入部年度は必須です"
      } else {
        const joinedAtNum = parseInt(formData.joinedAt)
        if (isNaN(joinedAtNum) || joinedAtNum < 2000 || joinedAtNum > 2030) {
          newErrors.joinedAt = "入部年度は2000年から2030年の間で入力してください"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ステップ進行処理
  const handleNext = () => {
    if (validateStep(step)) {
      if (step === "profile") {
        // 最終ステップの場合はサーバーサイドバリデーションのためにFormを送信
        setIsSubmitting(true)
      } else {
        nextStep()
      }
    }
  }

  // メール認証コード検証の処理
  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isLoaded || !signUp || loading || signUp.status === "complete") return

    setLoading(true)
    setErrors({})

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code })
      if (signUpAttempt.status === "complete") {
        setIsVerificationSuccess(true)
        await setActive({ session: signUpAttempt.createdSessionId })
        navigate("/onboarding")
      } else {
        setErrors({ general: "認証が完了しませんでした。再度お試しください。" })
      }
    } catch {
      setErrors({ general: "認証に失敗しました。再度お試しください。" })
      if (!isVerificationSuccess) {
        setLoading(false)
      }
    }
  }

  // サーバーサイドバリデーションエラーの処理
  React.useEffect(() => {
    if (actionData && isSubmitting) {
      setLoading(false)
      setIsSubmitting(false)

      if (actionData.errors) {
        const serverErrors = actionData.errors
        setErrors(serverErrors)

        // エラーがあるステップに戻る
        if (
          serverErrors.email ||
          serverErrors.newPassword ||
          serverErrors.confirmPassword
        ) {
          setStep("basic")
        } else if (
          serverErrors.firstName ||
          serverErrors.lastName ||
          serverErrors.username
        ) {
          setStep("personal")
        } else if (
          serverErrors.year ||
          serverErrors.grade ||
          serverErrors.joinedAt ||
          serverErrors.getGradeAt
        ) {
          setStep("profile")
        }
      } else if (actionData.success && actionData.formData) {
        // サーバーサイドバリデーション成功時、Clerk登録を実行
        setLoading(true)
        handleClerkSignUp(actionData.formData)
      }
    }
  }, [actionData, isSubmitting, handleClerkSignUp])

  if (step === "verify") {
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <ProgressIndicator step={step} />
        <h1 className={style.text.sectionTitle()}>メール認証</h1>

        {loading ? (
          <div className="text-center py-8">
            <div
              className={`animate-spin mx-auto mb-4 w-8 h-8 border-4 border-t-transparent rounded-full ${
                isVerificationSuccess ? "border-green-600" : "border-blue-600"
              }`}
            />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {isVerificationSuccess ? "認証完了！" : "認証処理中..."}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {isVerificationSuccess ? "アカウント設定中..." : "しばらくお待ちください"}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-slate-600 dark:text-slate-400">
              メールに届いた認証コードを入力してください
            </p>
            <Form
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
              />
              <button
                type="submit"
                className={style.button({ type: "primary", class: "col-span-3" })}
                disabled={loading}
              >
                認証する
              </button>
            </Form>
          </>
        )}

        {errors.general && (
          <div className={style.text.error({ className: "mt-4" })}>{errors.general}</div>
        )}
      </div>
    )
  }

  return (
    <div className={style.card.container({ class: "max-w-md mx-auto" })}>
      <ProgressIndicator step={step} />
      <h1 className={style.text.sectionTitle()}>サインアップ</h1>

      {loading && (step === "profile" || isSubmitting) ? (
        <div className="text-center py-12">
          <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">アカウントを作成中...</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            ユーザー登録を行っています
          </p>
        </div>
      ) : (
        <Form method="post" className={style.form.container({ vertical: true })}>
          {/* フォームの全データを隠しフィールドとして送信 */}
          {isSubmitting && (
            <>
              <input type="hidden" name="email" value={formData.email} />
              <input type="hidden" name="newPassword" value={formData.newPassword} />
              <input
                type="hidden"
                name="confirmPassword"
                value={formData.confirmPassword}
              />
              <input type="hidden" name="firstName" value={formData.firstName} />
              <input type="hidden" name="lastName" value={formData.lastName} />
              <input type="hidden" name="username" value={formData.username} />
              <input type="hidden" name="year" value={formData.year} />
              <input type="hidden" name="grade" value={formData.grade} />
              <input type="hidden" name="joinedAt" value={formData.joinedAt} />
              <input type="hidden" name="getGradeAt" value={formData.getGradeAt} />
            </>
          )}

          {step === "basic" && (
            <>
              <h2 className="col-span-3 text-lg font-semibold mb-2">基本情報</h2>

              <label htmlFor="email" className={style.form.label({ necessary: true })}>
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                value={formData.newPassword}
                onChange={e =>
                  setFormData(prev => ({ ...prev, newPassword: e.target.value }))
                }
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
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                }
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
                次へ
              </button>
            </>
          )}

          {step === "personal" && (
            <>
              <h2 className="col-span-3 text-lg font-semibold mb-2">個人情報</h2>

              <label htmlFor="lastName" className={style.form.label({ necessary: true })}>
                姓
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={e =>
                  setFormData(prev => ({ ...prev, lastName: e.target.value }))
                }
                autoComplete="family-name"
                required
                className={style.form.input({ class: "col-span-2" })}
              />
              {errors.lastName && (
                <div className={style.text.error({ className: "col-span-3" })}>
                  {errors.lastName}
                </div>
              )}

              <label
                htmlFor="firstName"
                className={style.form.label({ necessary: true })}
              >
                名
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={e =>
                  setFormData(prev => ({ ...prev, firstName: e.target.value }))
                }
                autoComplete="given-name"
                required
                className={style.form.input({ class: "col-span-2" })}
              />
              {errors.firstName && (
                <div className={style.text.error({ className: "col-span-3" })}>
                  {errors.firstName}
                </div>
              )}

              <label
                htmlFor="username"
                className={style.form.label({ necessary: false })}
              >
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={e =>
                  setFormData(prev => ({ ...prev, username: e.target.value }))
                }
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
                  次へ
                </button>
              </div>
            </>
          )}

          {step === "profile" && (
            <>
              <h2 className="col-span-3 text-lg font-semibold mb-2">プロファイル情報</h2>

              <label htmlFor="year" className={style.form.label({ necessary: true })}>
                学年
              </label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
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
                value={formData.grade}
                onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
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
                value={formData.joinedAt}
                onChange={e =>
                  setFormData(prev => ({ ...prev, joinedAt: e.target.value }))
                }
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

              <label
                htmlFor="getGradeAt"
                className={style.form.label({ necessary: false })}
              >
                級段位取得日
              </label>
              <input
                id="getGradeAt"
                name="getGradeAt"
                type="date"
                value={formData.getGradeAt}
                onChange={e =>
                  setFormData(prev => ({ ...prev, getGradeAt: e.target.value }))
                }
                className={style.form.input({ class: "col-span-2" })}
              />
              {errors.getGradeAt && (
                <div className={style.text.error({ className: "col-span-3" })}>
                  {errors.getGradeAt}
                </div>
              )}

              <div id="clerk-captcha" className="col-span-3" />

              <div className="col-span-3 flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className={style.button({ type: "secondary", class: "flex-1" })}
                >
                  戻る
                </button>
                <button
                  type={isSubmitting ? "submit" : "button"}
                  onClick={!isSubmitting ? handleNext : undefined}
                  className={style.button({ type: "primary", class: "flex-1" })}
                  disabled={loading}
                >
                  {loading ? "登録中..." : "アカウントを作成"}
                </button>
              </div>
            </>
          )}
        </Form>
      )}

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

const ProgressIndicator = ({
  step,
}: {
  step: "basic" | "personal" | "profile" | "verify"
}) => {
  const steps = ["基本情報", "個人情報", "プロファイル", "認証"]
  const currentIndex =
    step === "basic" ? 0 : step === "personal" ? 1 : step === "profile" ? 2 : 3

  const indicator = tv({
    base: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
    variants: {
      step: {
        current: "bg-blue-600 text-white",
        completed: "outline-2 outline-green-600 text-green-600",
        upcoming: "bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-200",
      },
    },
  })

  return (
    <div className="mb-6 flex justify-center gap-4">
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
          {idx < steps.length - 1 && <div className="w-6 h-0.5 bg-gray-300 mx-2" />}
        </div>
      ))}
    </div>
  )
}
