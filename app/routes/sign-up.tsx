import { useSignUp } from "@clerk/react-router"
import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import * as React from "react"
import { useEffect, useState } from "react"
import type { ActionFunctionArgs } from "react-router"
import { Link, useFetcher } from "react-router"

import { grade, year } from "../lib/utils"
import { style } from "../styles/component"

import { Icon } from "~/components/ui/Icon"

// MARK: Meta
export function meta() {
  return [
    { title: "サインアップ | ハム大合気ポータル" },
    { name: "description", content: "サインアップページ" },
  ]
}

// MARK: Action
type UnsafeMetadata = {
  year?: string
  grade?: number
  joinedAt?: number
  getGradeAt?: string | null
}

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
        JSON.stringify({ success: false, error: "Invalid User Infomation" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // リクエストから認証状態を取得
    const auth = await getAuth(args)

    if (!auth || !auth.userId || userId !== auth.userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // ユーザー情報を取得
    const user = await clerkClient.users.getUser(auth.userId)

    // unsafeMetadataからプロファイル情報を取得
    const unsafeMetadata = user.unsafeMetadata as UnsafeMetadata
    if (!unsafeMetadata || typeof unsafeMetadata !== "object") {
      return new Response(
        JSON.stringify({ success: false, error: "No profile data to migrate" }),
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

    // getGradeAtの処理: 空文字列はnull、有効な日付文字列はISO形式に変換
    let getGradeAt: string | null = null
    if (unsafeMetadata.getGradeAt === null) {
      getGradeAt = ""
    } else if (
      typeof unsafeMetadata.getGradeAt === "string" &&
      unsafeMetadata.getGradeAt.trim() !== ""
    ) {
      const dateStr = unsafeMetadata.getGradeAt.trim()
      try {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          getGradeAt = date.toISOString()
        }
      } catch {
        getGradeAt = ""
      }
    }

    if (!year || grade === undefined || joinedAt === undefined) {
      const missingFields = []
      if (!year) missingFields.push("year")
      if (grade === undefined) missingFields.push("grade")
      if (joinedAt === undefined) missingFields.push("joinedAt")

      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid profile data - missing or invalid: ${missingFields.join(", ")}`,
          received: { year, grade, joinedAt, getGradeAt },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // プロファイルデータをpublicMetadataに移動
    const profileData = { year, grade, joinedAt, getGradeAt, role: "member" as const }

    // publicMetadataを更新し、unsafeMetadataをクリア
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: profileData,
    })
    await clerkClient.users.updateUserMetadata(auth.userId, { unsafeMetadata: {} })

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
export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const fetcher = useFetcher()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [year, setYear] = useState("b1")
  const [grade, setGrade] = useState("0")
  const [joinedAt, setJoinedAt] = useState(new Date().getFullYear().toString())
  const [getGradeAt, setGetGradeAt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [migrationTriggered, setMigrationTriggered] = useState(false)
  const [otpCode, setOtpCode] = useState("")

  useEffect(() => {
    if (migrationTriggered && fetcher.state === "idle") {
      if (fetcher.data?.success) {
        window.location.href = "/"
      } else if (fetcher.data?.error) {
        setError(`プロファイル移行エラーが発生しました。`)
        setLoading(false)
      }
    }
  }, [fetcher.state, fetcher.data, migrationTriggered])

  // 2. プロファイルフォーム
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!isLoaded || !signUp || !setActive) {
      setError("認証サービスが利用できません")
      setLoading(false)
      return
    }
    if (
      !email ||
      !newPassword ||
      !confirmPassword ||
      !firstName ||
      !lastName ||
      !year ||
      !grade ||
      !joinedAt
    ) {
      setError("必須項目が入力されていません。")
      setLoading(false)
      return
    }
    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません")
      setLoading(false)
      return
    }
    try {
      // 1. ユーザー作成
      const signUpParams = {
        emailAddress: email,
        password: newPassword,
        firstName,
        lastName,
        username: username || undefined,
        unsafeMetadata: {
          year,
          grade: parseInt(grade),
          joinedAt: parseInt(joinedAt),
          getGradeAt: getGradeAt.trim() === "" ? null : getGradeAt,
        },
      }
      await signUp.create(signUpParams)
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setStep(3)
    } catch (err) {
      let errorMsg = "ユーザー登録に失敗しました"
      if (typeof err === "object" && err && "errors" in err) {
        errorMsg =
          (err as { errors?: { message?: string }[] }).errors?.[0]?.message || errorMsg
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // 3. メール検証
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!isLoaded || !signUp || !setActive) {
      setError("認証サービスが利用できません")
      setLoading(false)
      return
    }
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      })
      if (completeSignUp.status === "complete" && completeSignUp.createdUserId) {
        await setActive({ session: completeSignUp.createdSessionId })
        // サーバーアクションでpublicMetadata移行
        const userId = completeSignUp.createdUserId
        setMigrationTriggered(true)
        fetcher.submit({ email, userId }, { method: "POST" })
      } else {
        setError("メール認証が完了しませんでした。追加手順が必要な場合があります。")
      }
    } catch (err) {
      let errorMsg = "メール認証に失敗しました"
      if (typeof err === "object" && err && "errors" in err) {
        errorMsg =
          (err as { errors?: { message?: string }[] }).errors?.[0]?.message || errorMsg
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // --- UI ---
  if (step === 1) {
    // 基本情報フォーム
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <h1 className={style.text.sectionTitle()}>サインアップ</h1>
        <form
          onSubmit={e => {
            e.preventDefault()
            setStep(2)
          }}
          className={style.form.container({ vertical: true })}
        >
          <label htmlFor="email" className={style.form.label({ necessary: true })}>
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          <label htmlFor="lastName" className={style.form.label({ necessary: true })}>
            姓
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          <label htmlFor="firstName" className={style.form.label({ necessary: true })}>
            名
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          <label htmlFor="username" className={style.form.label({ necessary: false })}>
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={style.form.input({ class: "col-span-2" })}
          />
          <label htmlFor="password" className={style.form.label({ necessary: true })}>
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          <label
            htmlFor="password-confirm"
            className={style.form.label({ necessary: true })}
          >
            パスワード確認
          </label>
          <input
            id="password-confirm"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
          />
          <button
            type="submit"
            className={style.button({ type: "primary", class: "col-span-3" })}
          >
            次へ
          </button>
        </form>
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
        {error && (
          <div className={style.text.error({ className: "mt-4" })}>
            {error && "エラーが発生しました。"}
          </div>
        )}
      </div>
    )
  }
  if (step === 2) {
    // プロファイルフォーム＋登録ボタン
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <h1 className={style.text.sectionTitle()}>プロフィール設定</h1>
        <form
          onSubmit={handleProfileSubmit}
          className={style.form.container({ vertical: true })}
        >
          <label htmlFor="year" className={style.form.label({ necessary: true })}>
            学年
          </label>
          <select
            id="year"
            value={year}
            onChange={e => setYear(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
          >
            {yearOptions()}
          </select>
          <label htmlFor="grade" className={style.form.label({ necessary: true })}>
            現在の級段位
          </label>
          <select
            id="grade"
            value={grade}
            onChange={e => setGrade(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
          >
            {gradeOptions()}
          </select>
          <label htmlFor="joinedAt" className={style.form.label({ necessary: true })}>
            入部年度
          </label>
          <input
            id="joinedAt"
            type="number"
            value={joinedAt}
            onChange={e => setJoinedAt(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
            min="2000"
            max="2030"
          />
          <label htmlFor="getGradeAt" className={style.form.label({ necessary: false })}>
            級段位取得日
          </label>
          <input
            id="getGradeAt"
            type="date"
            value={getGradeAt}
            onChange={e => setGetGradeAt(e.target.value)}
            className={style.form.input({ class: "col-span-2" })}
          />
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
        </form>
        {error && (
          <div className={style.text.error({ className: "mt-4" })}>
            {error && "エラーが発生しました。"}
          </div>
        )}
      </div>
    )
  }
  if (step === 3) {
    // メール検証フォーム
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <h1 className={style.text.sectionTitle()}>メールアドレス認証</h1>
        <p className={style.text.body()}>メールに届いた認証コードを入力してください</p>
        <form
          onSubmit={handleVerify}
          className={style.form.container({ vertical: true })}
        >
          <input
            id="otpCode"
            name="otpCode"
            type="text"
            value={otpCode}
            onChange={e => setOtpCode(e.target.value)}
            required
            className={style.form.input({ class: "col-span-2" })}
            disabled={loading}
          />
          <button
            type="submit"
            className={style.button({ type: "primary" })}
            disabled={loading}
          >
            {loading ? "認証中…" : "認証する"}
          </button>
        </form>
        <p className={style.text.info()}>
          認証コードが届きませんか？迷惑メールフォルダを確認してください。
        </p>
        {error && (
          <div className={style.text.error({ className: "mt-4" })}>
            {error && "エラーが発生しました。"}
          </div>
        )}
      </div>
    )
  }
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
