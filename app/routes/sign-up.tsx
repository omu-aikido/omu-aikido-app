import { useClerk, useSignUp } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import * as React from "react"
import { useEffect, useState } from "react"
import type { LoaderFunctionArgs } from "react-router"
import { Form, Link, redirect, useNavigate } from "react-router"

import { Icon } from "~/components/ui/Icon"
import { grade, year } from "~/lib/utils"
import { style } from "~/styles/component"

export async function loader(args: LoaderFunctionArgs) {
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
export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData()
  const actionType = formData.get("actionType") as string

  if (actionType === "basic") {
    // 基本情報のステップ
    const email = formData.get("email") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const username = formData.get("username") as string

    const errors: Record<string, string> = {}

    // フィールドレベルのバリデーション
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

    if (!firstName) {
      errors.firstName = "名は必須です"
    }

    if (!lastName) {
      errors.lastName = "姓は必須です"
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors, step: 1 }
    }

    return {
      success: true,
      data: { email, newPassword, firstName, lastName, username },
      step: 2,
    }
  }

  if (actionType === "profile") {
    // プロファイル登録のステップ
    const year = formData.get("year") as string
    const grade = formData.get("grade") as string
    const joinedAt = formData.get("joinedAt") as string
    const getGradeAt = formData.get("getGradeAt") as string

    const errors: Record<string, string> = {}

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
      return { success: false, errors, step: 2 }
    }

    return {
      success: true,
      profileData: {
        year,
        grade: parseInt(grade),
        joinedAt: parseInt(joinedAt),
        getGradeAt: getGradeAt.trim() === "" ? null : getGradeAt,
      },
      step: "redirect", // メール認証ページにリダイレクト
    }
  }

  return { success: false, errors: { general: "不正なアクションです" }, step: 1 }
}

// MARK: Types
type ClientActionData = {
  success: boolean
  error?: string
  errors?: Record<string, string>
  step?: number | "redirect"
  data?: {
    email: string
    newPassword: string
    firstName: string
    lastName: string
    username: string
  }
  profileData?: {
    year: string
    grade: number
    joinedAt: number
    getGradeAt: string | null
  }
}

type BasicFormData = {
  email: string
  newPassword: string
  firstName: string
  lastName: string
  username: string
}

type ProfileData = {
  year: string
  grade: number
  joinedAt: number
  getGradeAt: string | null
}

// MARK: Component
export default function SignUpPage({ actionData }: { actionData?: ClientActionData }) {
  const { signUp, isLoaded } = useSignUp()
  const clerk = useClerk()
  const navigate = useNavigate()
  const [step, setStep] = useState(() => {
    if (actionData?.step && typeof actionData.step === "number") return actionData.step
    return 1
  })
  const [basicData, setBasicData] = useState<BasicFormData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sessionCleared, setSessionCleared] = useState(false)

  // ページ読み込み時にsessionを確実にクリア
  useEffect(() => {
    if (isLoaded && !sessionCleared) {
      const clearSession = async () => {
        try {
          await clerk.signOut()
          setSessionCleared(true)
        } catch {
          setSessionCleared(true)
        }
      }
      clearSession()
    }
  }, [isLoaded, clerk, sessionCleared])

  // Clerk サインアップ処理
  const handleClerkSignUp = React.useCallback(
    async (basic: BasicFormData, profile: ProfileData) => {
      if (!isLoaded || !signUp || !sessionCleared) {
        setErrors({ general: "認証サービスが利用できません" })
        return
      }

      setLoading(true)
      try {
        const signUpParams = {
          emailAddress: basic.email,
          password: basic.newPassword,
          firstName: basic.firstName,
          lastName: basic.lastName,
          username: basic.username || undefined,
          unsafeMetadata: {
            year: profile.year,
            grade: profile.grade,
            joinedAt: profile.joinedAt,
            getGradeAt: profile.getGradeAt,
          },
        }
        await signUp.create(signUpParams)
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" })

        // メール認証ページにリダイレクト
        navigate("/verify-email")
      } catch (err) {
        let errorMsg = "ユーザー登録に失敗しました"
        if (typeof err === "object" && err && "errors" in err) {
          errorMsg =
            (err as { errors?: { message?: string }[] }).errors?.[0]?.message || errorMsg
        }
        setErrors({ general: errorMsg })
        setStep(2)
      } finally {
        setLoading(false)
      }
    },
    [isLoaded, signUp, sessionCleared, navigate],
  )

  // actionDataの変更を監視してstepを更新
  useEffect(() => {
    if (actionData) {
      if (actionData.step && typeof actionData.step === "number") setStep(actionData.step)
      if (actionData.errors) setErrors(actionData.errors)
      if (actionData.error) setErrors({ general: actionData.error })

      if (actionData.success && actionData.data && step === 1) {
        setBasicData(actionData.data)
        setStep(2)
      }
      if (actionData.success && actionData.profileData && step === 2 && basicData) {
        handleClerkSignUp(basicData, actionData.profileData)
      }
    }
  }, [actionData, step, basicData, handleClerkSignUp])

  // Step 3のメール認証フォームを削除したため、useEffectも削除

  // sessionクリア中またはロード中はローディング表示
  if (!isLoaded || !sessionCleared) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="mt-2 text-sm text-gray-600">初期化中...</p>
        </div>
      </div>
    )
  }

  // --- UI ---
  if (step === 1) {
    // 基本情報フォーム
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <h1 className={style.text.sectionTitle()}>サインアップ</h1>
        <Form method="post" className={style.form.container({ vertical: true })}>
          <input type="hidden" name="actionType" value="basic" />

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
            type="submit"
            className={style.button({ type: "primary", class: "col-span-3" })}
            disabled={loading}
          >
            {loading ? "処理中..." : "次へ"}
          </button>
        </Form>
        <div className="my-6 border-t border-slate-200 dark:border-slate-700" />
        <button
          type="button"
          className="w-full py-2 px-4 bg-[#5865F2] dark:bg-[#4752C4] text-white font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#4752C4] dark:hover:bg-[#36418C] transition disabled:opacity-50"
          onClick={async () => {
            if (!isLoaded || !signUp) return
            setLoading(true)
            try {
              await signUp.authenticateWithRedirect({
                strategy: "oauth_discord",
                redirectUrl: window.location.href,
                redirectUrlComplete: window.location.href,
              })
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
        >
          <Icon icon={"discord-logo"} size="24" />
          Discordでサインアップ
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
  if (step === 2) {
    // プロファイルフォーム
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <h1 className={style.text.sectionTitle()}>プロフィール設定</h1>
        <Form method="post" className={style.form.container({ vertical: true })}>
          <input type="hidden" name="actionType" value="profile" />

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
            min="2000"
            max="2030"
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

          <button
            type="button"
            className={style.form.button({ type: "gray", class: "col-span-1" })}
            onClick={() => setStep(1)}
          >
            戻る
          </button>
          <button
            type="submit"
            className={style.form.button({ class: "col-span-2" })}
            disabled={loading}
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </Form>
        {errors.general && (
          <div className={style.text.error({ className: "mt-4" })}>{errors.general}</div>
        )}
      </div>
    )
  }

  // Step 3 (メール認証) は削除済み - verify-emailページに移動
  // 完了画面やリダイレクトはuseEffectで処理
  return null
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
