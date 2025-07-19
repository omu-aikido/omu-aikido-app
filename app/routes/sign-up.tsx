import { useSignUp } from "@clerk/react-router"
import * as React from "react"
import { Link, useFetcher } from "react-router"

import { style } from "../styles/component"

import { Icon } from "~/components/ui/Icon"

// MARK: Meta
export function meta() {
  return [
    { title: "サインイン | ハム大合気ポータル" },
    { name: "description", content: "サインインページ" },
  ]
}

// MARK: Component
export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const fetcher = useFetcher()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!isLoaded || !signUp || !setActive) {
      setError("認証サービスが利用できません")
      setLoading(false)
      return
    }
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        window.location.href = "/"
      } else {
        setError("追加認証が必要です。")
      }
    } catch (err) {
      let errorMsg = "サインアップに失敗しました"
      if (typeof err === "object" && err && "errors" in err) {
        errorMsg = (err as { errors?: { message?: string }[] }).errors?.[0]?.message || errorMsg
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={style.card.container("max-w-md mx-auto")}>
      <h1 className={style.text.sectionTitle()}>サインアップ</h1>
      <fetcher.Form method="post" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={style.form.label()}>
            メールアドレス
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={style.form.input()}
            />
          </label>
        </div>
        <div>
          <label htmlFor="password" className={style.form.label()}>
            パスワード
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={style.form.input()}
            />
          </label>
        </div>
        {error && <div className={style.text.error()}>サインアップに失敗しました。</div>}
        <button
          type="submit"
          disabled={loading}
          className={style.button.default({ type: "primary", disabled: loading })}
        >
          {loading ? "サインアップ中..." : "サインアップ"}
        </button>
      </fetcher.Form>
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
              redirectUrl: "/",
              redirectUrlComplete: "/",
            })
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
      >
        <Icon icon={"discord-logo"} size="24" />
        Discordで登録
      </button>
      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        サインアップ済みですか？
        <br />
        <span className={style.text.link()}>
          <Link to="/sign-in">こちら</Link>
        </span>
        からサインインできます。
      </div>
    </div>
  )
}
